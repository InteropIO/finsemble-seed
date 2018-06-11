import React from "react";
import ReactDOM from "react-dom";
import HoverDetector from "./HoverDetector.jsx";

import { FinsembleDraggable } from "@chartiq/finsemble-react-controls";
const ICON_AREA = 29;
const CLOSE_BUTTON_MARGIN = 22;
/**
 * This component is pretty basic. It just takes a bunch of props and renders them.
 */
export default class Tab extends React.Component {
	constructor(props) {
		super(props);
		this.onDragOver = this.onDragOver.bind(this);

		this.state = {
			hoverState: "false"
		};
	}
	onDragOver(e) {
		console.log("on drag over in tab")
		let boundingBox = this.refs.Me.getBoundingClientRect();
		if (this.crossedMidline(e, boundingBox)) {
			this.props.onTabDraggedOver(e, this.props.windowIdentifier);
		}
	}
	crossedMidline(e, box) {
		return FSBL.Clients.WindowClient.isPointInBox({ x: e.nativeEvent.screenX, y: e.nativeEvent.screenY }, box);
	}
	hoverAction(newHoverState) {
		this.setState({ hoverState: newHoverState });
	}
	componentWillUnmount() {
		console.log("tab will unmount", this)
	}
	render() {
		let titleWidth = this.props.tabWidth - ICON_AREA - CLOSE_BUTTON_MARGIN;
		let style = {
			width: this.props.tabWidth
		}
		let self = this;
		return (
			<div
				ref="Me"
				onDrop={this.props.onDrop}
				onClick={this.props.onClick}
				onDragStart={function (e) {
					self.props.onDragStart(e, self.props.windowIdentifier)
				}}
				onDragEnd={this.props.onDragEnd}
				draggable={true}
				className={this.props.className}
				data-hover={this.state.hoverState}
				style={style}
			>
				{this.props.listenForDragOver &&
					<div className="tab-drop-region"
						onDragOver={this.onDragOver}
					></div>
				}
				<HoverDetector edge="top" hoverAction={this.hoverAction.bind(this)} />
				<div className="fsbl-tab-logo"><i className="ff-grid"></i></div>
				<div className="fsbl-tab-title" style={{ width: titleWidth }}>{this.props.title}</div>
				<div className="fsbl-tab-close" onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					this.props.onTabClose(e);
				}}>
					<i className="ff-close"></i>
				</div>
			</div>
		);
	}
}