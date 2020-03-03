/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

/**
 * The image carousel which displays images for a single app
 * @param {object} props Component props
 * @param {func} props.nextImage Function supplied by the parent to page through the images (right)
 * @param {func} props.previousImage Function supplied by the parent to page through the images (left)
 * @param {array} props.images The images of the displayed app
 */
const ImageCarousel = props => {
	return (
		<div className="image-carousel-container">
			<i className='ff-adp-chevron-left' onClick={props.nextImage}></i>
			<div className="image-carousel">
				{props.images.map((imageUrl, i) => {
					return (
						<img key={"showcase-image-" + i} className='image-carousel-image' src={imageUrl} onClick={props.openModal.bind(this, imageUrl)} />
					);
				})}
			</div>
			<i className='ff-adp-chevron-right' onClick={props.previousImage}></i>
		</div>
	);
}

export default ImageCarousel;