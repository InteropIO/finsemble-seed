/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

/**
 * This detects mouseover and mouseout and reacts by setting the hover attribute of the parent. We use this because the :hover pseudo-class doesn't detect
 * when the mouse leaves if it is on the edge of a finsemble window. This class requires the property "hoverAction" which should point back to a function
 * in the parent class to call to toggle the hover state.
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
		this.ref = null;
		this.setRef = element => {
			this.ref = element;
		}
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
	 * After the component is mounted, we use a DOM ref to determine how to position the HoverDetector. We want there to always be at least 5 pixels of space
	 * between the HoverDetector and any window edge. So we do some math to figure out the pixel coordinates of our parent node and then from there we figure
	 * out how many pixels of edge we need to create on our HoverDetector.
	 */
	componentDidMount() {
		let hoverDetector = this.ref;
		let parentNode = hoverDetector.parentNode;
		let rect = parentNode.getBoundingClientRect();
		let left = rect.left, top = rect.top, right = window.innerWidth - rect.right, bottom = window.innerHeight - rect.bottom;

		// Deal with components that are technically off the edge of the window. This can happen due to idiosyncracies with margin
		left = left > 0 ? left : 0;
		top = top > 0 ? top : 0;
		right = right > 0 ? right : 0;
		bottom = bottom > 0 ? bottom : 0;
		
		// Set the styles to position the HoverDetector
		hoverDetector.style.left = (left < 5 ? (5 - left) : 0) + "px";
		hoverDetector.style.top = (top < 5 ? (5 - top) : 0) + "px";
		hoverDetector.style.right = (right < 5 ? (5 - right) : 0) + "px";
		hoverDetector.style.bottom = (bottom < 5 ? (5 - bottom) : 0) + "px";
	}
	/**
	 * Render method.
	 *
	 * @returns
	 * @memberof HoverDetector
	 */
	render() {
		return (<div ref={this.setRef} onMouseEnter={this.onMouseEnter}
			onMouseLeave={this.onMouseLeave}
			style={{position: "absolute"}}
		></div>);
	}
}