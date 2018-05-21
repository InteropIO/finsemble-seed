import React from "react";
import ReactDOM from "react-dom";
import { FinsembleDraggable } from "@chartiq/finsemble-react-controls";
export default class Tab extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let titleWidth = this.props.tabWidth - 20;
		console.log("TAB WIDTH", this.props.tabWidth);
		let style = {
			width: this.props.tabWidth
		}
		return (
			<div
				onClick={this.props.onClick}
				onDragStart={this.props.onDragStart}
				onDragEnd={this.props.onDragEnd}
				draggable={true}
				draggableId={this.props.windowIdentifier} className={this.props.className}
				style={style}>
				<div className="fsbl-tab-logo"><i className="ff-grid"></i></div>
				<div className="fsbl-tab-title" style={{ width: titleWidth - 20 + 'px' }}>{this.props.title}</div>
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