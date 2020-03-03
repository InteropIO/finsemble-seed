/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

/**
 * A display component for tag name. Contains a stylized label
 * @param {object} props Component props
 * @param {string} props.name The name of the tag
 * @param {func} props.removeTag Parent function to remove a tag from active filters
 */
const Tag = props => {
	const remove = () => {
		props.removeTag(props.name);
	}

	return (
		<div className='app-tag'>
			<div className='tag-content'>
				<div className='tag-name'>{props.name}</div>&nbsp;&nbsp;
				<i className='ff-close tag-delete' onClick={remove}></i>
			</div>
		</div>
	);
}

export default Tag;