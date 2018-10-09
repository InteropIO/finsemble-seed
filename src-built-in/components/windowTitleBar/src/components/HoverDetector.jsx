/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

/**
 * This detects mouseover and mouseout and reacts by setting the hover attribute of the parent. We use this because the :hover pseudo-class doesn't detect
 * when the mouse leaves if it is on the edge of a finsemble window. This class requires the property "hoverAction" which should point back to a function
 * in the parent class to call to toggle the hover state. Also requires the property "edge" which can be "right","left","top","bottom" or a combination (separated by whitespace).
 * The hover detector will set its positioning within the parent element depending on which edges are enabled.
 * 
 * The parent element must have position: relative or position: absolute!
 * 
 * @since version 3.1.1 HoverDetector is now in the finsemble-react-controls repo
 * @since version 3.1.1 HoverDetector now uses dynamic styles. The fsbl-hover-detector-* css classes are deprecated.
 */
export default class HoverDetector extends React.Component{
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
	 * Render method. A HoverDetector can take one or more "edges". An edge can be "top","bottom","right","left".
	 *
	 * @returns
	 * @memberof HoverDetector
	 */
	render() {
		let edge = this.props.edge || "top";
		edge = edge.split(/[ ,]+/); // split by whitespace or commas
		let top = 0, bottom = 0, left = 0, right = 0;
		if (edge.indexOf("top") != -1) top = 5;
		if (edge.indexOf("bottom") != -1) bottom = 5;
		if (edge.indexOf("left") != -1) left = 5;
		if (edge.indexOf("right") != -1) right = 5;

		return (<div onMouseEnter={this.onMouseEnter}
			onMouseLeave={this.onMouseLeave}
			style={{position: "absolute", left: left, right: right, top: top, bottom: bottom}}
		></div>);
	}
}