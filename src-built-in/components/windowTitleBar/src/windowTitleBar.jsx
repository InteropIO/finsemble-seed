
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
// const Test from './test';

import * as storeExports from "./stores/windowTitleBarStore";
let HeaderData, HeaderActions, windowTitleBarStore;

//Parts that make up the windowTitleBar.
//Left side
import Linker from "./components/left/LinkerButton";
import Sharer from "./components/left/ShareButton.jsx";
//Right side
import Minimize from "./components/right/MinimizeButton.jsx";
import DockingButton from "./components/right/DockingButton.jsx";
import Maximize from "./components/right/MaximizeButton.jsx";
import Close from "./components/right/CloseButton.jsx";
import BringSuiteToFront from "./components/right/BringSuiteToFront.jsx";
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.scss";

/**
 * This is the main window manager component. It's the custom window frame that we add to each window that has useFSBLHeader set to true in its windowDescriptor.
 */
class WindowTitleBar extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		windowTitleBarStore.getValue({ field: "Maximize.hide" });
		this.state = {
			windowTitle: windowTitleBarStore.getValue({ field: "Main.windowTitle" }),
			minButton: !windowTitleBarStore.getValue({ field: "Minimize.hide" }),
			maxButton: !windowTitleBarStore.getValue({ field: "Maximize.hide" }),
			closeButton: !windowTitleBarStore.getValue({ field: "Close.hide" }),
			showLinkerButton: windowTitleBarStore.getValue({ field: "Linker.showLinkerButton" }),
			isTopRight: windowTitleBarStore.getValue({ field: "isTopRight" }),
		};
	}
	/**
     * This is necessary to make sure that the `this` inside of the callback is correct.
     *
     * @memberof WindowTitleBar
     */
	bindCorrectContext() {
		this.onTitleChange = this.onTitleChange.bind(this);
		this.onShowDockingToolTip = this.onShowDockingToolTip.bind(this);
		this.onToggleDockingIcon = this.onToggleDockingIcon.bind(this);
		this.onDocking = this.onDocking.bind(this);
		this.showLinkerButton = this.showLinkerButton.bind(this);
		this.isTopRight = this.isTopRight.bind(this);
	}
	componentWillMount() {
		windowTitleBarStore.addListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDocking },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "isTopRight", listener: this.isTopRight},
		]);
	}

	componentWillUnmount() {
		windowTitleBarStore.removeListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDocking },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "isTopRight", listener: this.isTopRight},
		]);
	}

	showLinkerButton(err, response) {
		//console.log("showLinkerButton--", response)
		this.setState({ showLinkerButton: response.value });
	}

	isTopRight(err, response) {
		this.setState({ isTopRight: response.value });
	}

	onTitleChange(err, response) {
		this.setState({ windowTitle: response.value });
	}

	onShowDockingToolTip(err, response) {
		this.setState({ showDockingTooltip: response.value });
	}

	onToggleDockingIcon(err, response) {
		// console.log("ws docking icon change")
		this.setState({
			dockingIcon: response.value
		});
	}

	onDocking(err, response) {
		this.setState({ dockingEnabled: response.value });
	}
	onStoreChanged(newState) {
		this.setState(newState);
	}
	render() {
		var self = this;
		//console.log("showLinkerButton--2", this.state)

		let showDockingIcon = !self.state.dockingEnabled ? false : self.state.dockingIcon;
		let isGrouped = (self.state.dockingIcon == "ejector");
		let showMinimizeIcon = (isGrouped && self.state.isTopRight) || !isGrouped; //If not in a group or if topright in a group
		return (<div className="fsbl-header">
			<div className="fsbl-header-left">
				{self.state.showLinkerButton ? <Linker /> : null}
				<Sharer />
			</div>
			<div onMouseDown={this.startLongHoldTimer} className="fsbl-header-center cq-drag">{self.state.windowTitle}</div>
			<div onMouseDown={this.startLongHoldTimer} className="fsbl-header-right">
				<BringSuiteToFront/>
				{this.state.minButton && showMinimizeIcon ? <Minimize /> : null}
				{showDockingIcon ? <DockingButton /> : null}
				{this.state.maxButton ? <Maximize /> : null}
				{this.state.closeButton ? <Close /> : null}

			</div>
		</div>);
	}
}


FSBL.addEventListener("onReady", function () {
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTitleBar />, document.getElementById("FSBLHeader"));
	});
});
