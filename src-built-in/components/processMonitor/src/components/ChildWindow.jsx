import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
/**
 * This file is the react component for an individual window beneath a process. It allows the user to close the window.
 */
export default class ChildWindow extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		//If we're in simple mode, onClick does nothing. In advanced mode, we'll identify the window by making it flash.
		let cwClickHandler =
			this.props.viewMode === "simple"
				? Function.prototype
				: () => {
						Actions.identifyWindow(this.props.cw);
				  };
		let childWindowClasses = `child-window ${this.props.viewMode}`;
		return (
			<div className={childWindowClasses}>
				<div className="child-window-actions">
					<i
						className="close-window ff-close"
						onClick={() => {
							Actions.closeWindow(this.props.cw);
						}}
					></i>
				</div>
				<div className="child-window-name" onClick={cwClickHandler}>
					{this.props.cw.name}
				</div>
			</div>
		);
	}
}
