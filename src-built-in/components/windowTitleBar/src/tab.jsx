import React from "react";
import ReactDOM from "react-dom";

export default class Tab extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let titleWidth = this.props.tabWidth - 20;
		return (
			<div className="fsbl-tab">
				<div className="fsbl-title" style={{ width: titleWidth - 20 + 'px' }}>{this.props.title}</div>
			</div>
		);
	}
}