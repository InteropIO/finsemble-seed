/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React, { Component } from "react";

//data
import storeActions from "../../stores/storeActions";

//components
import Modal from "./Modal";
import Header from "./Header";
import ImageCarousel from "./ImageCarousel";
import AppDescription from "./AppDescription";
import ReleaseNotes from "./ReleaseNotes";
import AppDevNotes from "./AppDevNotes";
import VersionNotes from "./VersionNotes";
import SupportNotes from "./SupportNotes";
import AppCard from "../AppCard";

const imagesInCarousel = 4;
class AppShowcase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.app.title || this.props.app.name,
			iconUrl:
				this.props.app.icons !== undefined &&
				this.props.app.icons[0].url !== undefined
					? this.props.app.icons[0].url
					: "../assets/placeholder.svg",
			entitled: this.props.app.entitled ? this.props.app.entitled : false,
			imageIndex: 0,
			imageModalOpen: false,
			modalImage: null,
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.nextImage = this.nextImage.bind(this);
		this.previousImage = this.previousImage.bind(this);
		this.openSite = this.openSite.bind(this);
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.addTag = this.addTag.bind(this);
	}
	/**
	 * Pages right through the app's images.
	 */
	nextImage() {
		let index = this.state.imageIndex;

		//We want to increase the image index for the carousel, but if this paging action takes us past the length of the image array, we need to reset
		if (index + 1 > this.props.app.images.length) {
			index = 0;
		} else {
			index++;
		}

		this.setState({
			imageIndex: index,
		});
	}
	/**
	 * Pages left through the app's images.
	 */
	previousImage() {
		let index = this.state.imageIndex;

		//We want to decrease the image index for the carousel, but if this paging action takes us under 0, we need to reset
		if (index - 1 < 0) {
			index = this.props.app.images.length - 1;
		} else {
			index--;
		}

		this.setState({
			imageIndex: index,
		});
	}
	/**
	 * Opens the publisher's website.
	 */
	//NOTE: There is currently no prop in the FDC spec that has a dev site.
	openSite() {
		console.log("open the developers site");
	}
	/**
	 * Opens the image modal (light box). Sets the image to display
	 * @param {string} url The image url to display in the light box
	 */
	openModal(url) {
		this.setState({
			modalImage: url,
			imageModalOpen: true,
		});
	}
	/**
	 * Closes the image modal
	 */
	closeModal() {
		this.setState({
			imageModalOpen: false,
			modalImage: null,
		});
	}
	/**
	 * Calls the parents function to add a tag to list of filters
	 * @param {string} name The tag name
	 */
	addTag(name) {
		storeActions.addTag(name);
	}
	render() {
		let { name, iconUrl, imageIndex: index } = this.state;

		let images = [];
		for (let i = 0; i < imagesInCarousel; i++) {
			if (index > this.props.app.images.length - 1) {
				index = 0;
			}

			let imageUrl =
				this.props.app.images[index].url !== undefined
					? this.props.app.images[index].url
					: "../assets/placeholder.svg";
			images.push(imageUrl);
			index++;
		}
		return (
			<div className="app-showcase">
				<Modal open={this.state.imageModalOpen} closeModal={this.closeModal}>
					<img src={this.state.modalImage} className="modal-image" />
				</Modal>
				{!this.state.entitled && (
					<div className="app-warning">
						<span className="app-warning-wrapper">
							<span className="app-warning-text">
								You don't have permission to add this App.{" "}
								<a href="#">Contact your administrator</a> to request
								permission.
							</span>
						</span>
					</div>
				)}
				<Header
					iconUrl={iconUrl}
					entitled={this.state.entitled}
					{...this.props.app}
				/>

				<ImageCarousel
					nextImage={this.nextImage}
					previousImage={this.previousImage}
					openModal={this.openModal}
					images={images}
				/>

				<AppDescription description={this.props.app.description} />

				<ReleaseNotes releaseNotes={this.props.app.releaseNotes} />

				<AppDevNotes
					email={this.props.app.contactEmail}
					publisher={this.props.app.publisher}
				/>

				<VersionNotes version={this.props.app.version} />

				<SupportNotes
					email={this.props.app.supportEmail}
					tags={this.props.app.tags}
				/>
			</div>
		);
	}
}

export default AppShowcase;
