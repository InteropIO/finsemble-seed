/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

const ImageCarousel = props => {
	return (
		<div className="image-carousel-container">
			<i className='ff-chevron-left' onClick={props.nextImage}></i>
			<div className="image-carousel">
				{props.images.map((imageUrl, i) => {
					return (
						<img key={"showcase-image-" + i} className='image-carousel-image' src={imageUrl} onClick={props.openModal.bind(this, imageUrl)} />
					);
				})}
			</div>
			<i className='ff-chevron-right' onClick={props.previousImage}></i>
		</div>
	);
}

export default ImageCarousel;