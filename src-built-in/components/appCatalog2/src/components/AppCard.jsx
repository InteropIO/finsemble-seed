/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

const AppCard = props => {
	let imageUrl = props.images !== undefined ? props.images[0].url : "../assets/placeholder.svg";
	let title = props.title !== undefined ? props.title : props.name;

	return (
		<div className='app-card'>
			<img className='app-image' src={imageUrl} />
			<h4 className='app-title'>{title}</h4>
			<div className='app-tags'>
				<i className="ff-tag"></i>
				{props.tags.map((tag, i) => {
					let newTag = tag[0].toUpperCase() + tag.substring(1);
					if (i !== props.tags.length - 1) {
						newTag += ", ";
					}

					return (
						<h4 key={i}>
							{newTag}
						</h4>
					);
				})}
			</div>
		</div>
	);
}

export default AppCard;