/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React, { Component } from "react";

//components
import Modal from './Modal';

class AppShowcase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.app.title !== undefined ? this.props.app.title : this.props.app.name,
			iconUrl: this.props.app.icons !== undefined && this.props.app.icons[0].url !== undefined ? this.props.app.icons[0].url : "../assets/placeholder.svg",
			entitled: this.props.app.entitled ? this.props.app.entitled : false,
			imageIndex: 0,
			imageModalOpen: false,
			modalImage: null
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.nextImage = this.nextImage.bind(this);
		this.previousImage = this.previousImage.bind(this);
		this.openSite = this.openSite.bind(this);
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.addApp = this.addApp.bind(this);
	}
	nextImage() {
		let index = this.state.imageIndex + 1 > this.props.app.images.length - 1 ? 0 : this.state.imageIndex + 1;

		this.setState({
			imageIndex: index
		});
	}
	previousImage() {
		let index = this.state.imageIndex - 1 < 0 ? this.props.app.images.length - 1 : this.state.imageIndex - 1;

		this.setState({
			imageIndex: index
		});
	}
	openSite() {
		console.log('open the developers site');
	}
	openModal(url) {
		this.setState({
			modalImage: url,
			imageModalOpen: true
		});
	}
	closeModal() {
		this.setState({
			imageModalOpen: false,
			modalImage: null
		});
	}
	addApp(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.addApp(this.state.name);
	}
	render() {
		let { name, installed, iconUrl, imageIndex:index } = this.state;

		let images = [];
		for (let i = 0; i < 4; i++) {

			if (index > this.props.app.images.length - 1) {
				index = 0;
			}

			let imageUrl = this.props.app.images[index].url !== undefined ? this.props.app.images[index].url : "../assets/placeholder.svg";
			images.push(imageUrl);
			index++;
		}

		let addApp = this.props.app.installed ? this.removeApp : this.addApp;

		return (
			<div className="app-showcase">
				<Modal open={this.state.imageModalOpen} closeModal={this.closeModal}>
					<img src={this.state.modalImage} className="modal-image" />
				</Modal>
				{this.state.entitled ? (
					<div className="app-warning">
						<span>
							<i className='ff-info'></i>
							<span className='app-warning-text'>
								You don't have permission to add this App. <a href='#'>Contact your administrator</a> to request permission.
							</span>
						</span>
					</div>
				) : null}
				<div className="header">
					<div className='icon-title-container'>
						<img className="header-icon" src={iconUrl} />
						<span className="appName">{name}</span>
					</div>
					<div className='action-button-container'>
						<button className={this.state.entitled ? "action-button disabled" : "action-button"} disabled={this.state.entitled} onClick={addApp}>
							{this.props.app.installed ? (
								<span className="action-button-label">Open</span>
							) : (
								<span className="action-button-label">
									<i className="ff-plus"></i>
									&nbsp;My Apps
								</span>
							)}
						</button>
					</div>
				</div>
				{this.props.app.installed ? <div className='remove-button'>
							<i className='ff-close-2'></i>
							&nbsp;Remove App
						</div> : null}
				<div className="image-carousel-container">
					{/* <div className="paginate_carat_left" onClick={this.nextImage} /> */}
					<i className='ff-chevron-left' onClick={this.nextImage}></i>
					<div className="image-carousel">
						{images.map((imageUrl, i) => {
							return (
								<img key={"showcase-image-" + i} className='image-carousel-image' src={imageUrl} onClick={this.openModal.bind(this, imageUrl)} />
							);
						})}
					</div>
					{/* <div className="paginate_carat_right" onClick={this.previousImage} /> */}
					<i className='ff-chevron-right' onClick={this.previousImage}></i>
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
							{this.props.app.tags.map((tag, i) => {
								let tagName = tag[0].toUpperCase() + tag.substring(1);

								return (
									<div key={"showcase-tag-label-" + i} className="tag-label">
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