import React from "react";
import ReactDOM from "react-dom";
import { FinsembleDraggable } from "@chartiq/finsemble-react-controls";
/**
 * This component is pretty basic. It just takes a bunch of props and renders them.
 */
export default class Tab extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let titleWidth = this.props.tabWidth - 20;
		let style = {
			width: this.props.tabWidth
		}
		return (
			<div
				onClick={this.props.onClick}
				onDragStart={(e) => {
					this.props.onDragStart(e, this.props.windowIdentifier)
				}}
				onDragEnd={this.props.onDragEnd}
				draggable={true}
				className={this.props.className}
				style={style}
				title={this.props.title}>
				<div className="fsbl-tab-logo"><i className="ff-grid"></i></div>
				<div className="fsbl-tab-title">{this.props.title}</div>
				<div className="fsbl-tab-close" onClick={(e) => {
					e.preventDefault();
					this.props.onTabClose(e);
				}}>
					<i className="ff-close"></i>
				</div>
			</div>
		);
	}
}