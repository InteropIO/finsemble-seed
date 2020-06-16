/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";

/**
 * This detects mouseover and mouseout and reacts by setting the hover attribute of the parent. We use this because the :hover pseudo-class doesn't detect
 * when the mouse leaves if it is on the edge of a finsemble window. This class requires the property "hoverAction" which should point back to a function
 * in the parent class to call to toggle the hover state. Also requires the property "edge" which can be "right","left" or "top" depending on the location
 * of the parent div in the header bar.
 */
export default class HoverDetector extends React.Component {
	constructor(props) {
		super(props);
		this.bindCorrectContext();
	}
	/**
	 * This is necessary to make sure that the `this` inside of the callback is correct.
	 *
	 * @memberof HoverDetector
	 */
	bindCorrectContext() {
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
	}
	/**
	 * When the mouse enters the hoverDetector, we fire off the action that's passed in from the parent.
	 *
	 * @memberof HoverDetector
	 */
	onMouseEnter() {
		this.props.hoverAction("true");
	}
	/**
	 * When the mouse enters the hoverDetector, we fire off the action that's passed in from the parent.
	 *
	 * @memberof HoverDetector
	 */
	onMouseLeave() {
		this.props.hoverAction("false");
	}
	/**
	 * Render method.
	 *
	 * @returns
	 * @memberof HoverDetector
	 */
	render() {
		let edge = this.props.edge || "top";
		let iconClass = "fsbl-hover-detector-" + edge;

		return (
			<div
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
				className={iconClass}
			></div>
		);
	}
}
