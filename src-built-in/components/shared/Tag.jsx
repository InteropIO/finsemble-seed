/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

import "./style.css";

const Tag = (props) => {
	const remove = () => {
		props.removeTag(props.name);
	};

	return (
		<div className="app-tag">
			<div className="tag-content">
				<div className="tag-name">{props.name}</div>&nbsp;&nbsp;
				<i className="ff-close tag-delete" onClick={remove}></i>
			</div>
		</div>
	);
};

export default Tag;
