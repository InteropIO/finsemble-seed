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
import Header from './Header';
import ImageCarousel from './ImageCarousel';
import AppDescription from './AppDescription';
import ReleaseNotes from './ReleaseNotes';
import AppDevNotes from './AppDevNotes';
import VersionNotes from './VersionNotes';
import SupportNotes from './SupportNotes';

class AppShowcase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.app.title || this.props.app.name,
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
		this.removeApp = this.removeApp.bind(this);
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
	removeApp(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.removeApp(this.state.name);
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

		let appAction = this.props.app.installed ? Function.prototype : this.addApp;

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
				<Header iconUrl={iconUrl} name={name} entitled={this.state.entitled} appAction={appAction} removeApp={this.removeApp} />
				<ImageCarousel nextImage={this.nextImage} previousImage={this.previousImage} openModal={this.openModal} images={images} />
				<AppDescription description={this.props.app.description} />
				<ReleaseNotes releaseNotes={this.props.app.releaseNotes} />
				<AppDevNotes email={this.props.app.contactEmail} publisher={this.props.app.publisher} />
				<VersionNotes version={this.props.app.version} />
				<SupportNotes email={this.props.app.supportEmail} tags={this.props.app.tags} />
			</div>
		);
	}
}

export default AppShowcase;