import React from "react";
import ReactDOM from "react-dom";
import { FinsembleHoverDetector } from "@chartiq/finsemble-ui/react/components";
import Logo from "./logo";
import Title from "../../../common/windowTitle"
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
	}
	render() {
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
				<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction.bind(this)} />
				<Logo windowIdentifier={this.props.windowIdentifier} />
				<Title titleWidth={this.props.titleWidth} windowIdentifier={this.props.windowIdentifier} />
				<div className="fsbl-tab-close" onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					this.props.onTabClose(e);
				}}>
					<i className="ff-close"></i>
				</div>
			</div >
		);
	}
}