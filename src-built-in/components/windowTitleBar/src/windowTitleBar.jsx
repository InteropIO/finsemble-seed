
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
// const Test from './test';

import * as storeExports from "./stores/windowTitleBarStore";
let HeaderData, HeaderActions, windowTitleBarStore;

import HoverDetector from "./components/HoverDetector.jsx";

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
import Tab from './tab.jsx'
import "../../assets/css/finsemble.css";

/**
 * This is the main window manager component. It's the custom window frame that we add to each window that has useFSBLHeader set to true in its windowDescriptor.
 */
class WindowTitleBar extends React.Component {
	constructor() {
		super();
		this.grabbedTab = null;

		this.setTabRef = function(element) {
			this.grabbedTab = element;
		}.bind(this);

		this.resetTabRef = function() {
			this.grabbedTab = null;
		}.bind(this);

		this.bindCorrectContext();
		windowTitleBarStore.getValue({ field: "Maximize.hide" });
		this.state = {
			windowTitle: windowTitleBarStore.getValue({ field: "Main.windowTitle" }),
			minButton: !windowTitleBarStore.getValue({ field: "Minimize.hide" }),
			maxButton: !windowTitleBarStore.getValue({ field: "Maximize.hide" }),
			closeButton: !windowTitleBarStore.getValue({ field: "Close.hide" }),
			showLinkerButton: windowTitleBarStore.getValue({ field: "Linker.showLinkerButton" }),
			isTopRight: windowTitleBarStore.getValue({ field: "isTopRight" }),
			titleBarIsHoveredOver: windowTitleBarStore.getValue({ field: "titleBarIsHoveredOver" })
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
		this.toggleDrag = this.toggleDrag.bind(this);
		this.startDrag = this.startDrag.bind(this);
		this.cancelDrag = this.cancelDrag.bind(this);
		this.stopDrag = this.stopDrag.bind(this);
	}
	componentWillMount() {
		windowTitleBarStore.addListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDocking },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "isTopRight", listener: this.isTopRight },
		]);
	}

	componentWillUnmount() {
		windowTitleBarStore.removeListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDocking },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "isTopRight", listener: this.isTopRight },
		]);
	}

	componentDidMount() {
		let header = document.getElementsByClassName("fsbl-header")[0];
		let headerHeight = window.getComputedStyle(header, null).getPropertyValue("height");
		document.body.style.marginTop = headerHeight;
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
	toggleDrag(isHovered) {
		var clonedTab = document.getElementsByClassName('header-title')[0].cloneNode(true);
		// isHovered is a string so a boolean check doesn't work
		if(isHovered=="true"){
			this.setState({
				titleBarIsHoveredOver: true
			});
			document.getElementsByClassName('fsbl-header-center')[0].parentElement.insertAfter(clonedTab, null);
		} else if(isHovered=="false") {
			this.setState({
				titleBarIsHoveredOver: false
			});
			clonedTab.remove();
		}
	}
	cancelDrag() {
		console.log('cancelled drag')
		this.setState({
			titleBarIsHoveredOver: false
		});
	}
	startDrag() {
		FSBL.Clients.WindowClient.startTilingOrTabbing({windowIdentifier: FSBL.Clients.WindowClient.getWindowIdentifier()});
	}
	stopDrag(e) {
		FSBL.Clients.WindowClient.stopTilingOrTabbing();
	}
	render() {
		var self = this;

		let showDockingIcon = !self.state.dockingEnabled ? false : self.state.dockingIcon;
		let isGrouped = (self.state.dockingIcon == "ejector");
		let showMinimizeIcon = (isGrouped && self.state.isTopRight) || !isGrouped; //If not in a group or if topright in a group
		return (
			<div className="fsbl-header">
				<HoverDetector hoverAction={this.toggleDrag} />
				<div className="fsbl-header-left">
					{self.state.showLinkerButton ? <Linker /> : null}
					<Sharer />
				</div>
				<div className="fsbl-header-center cq-drag"><div draggable={true} onDragStart={this.startDrag} onDragEnd={this.stopDrag} onDragExit={this.cancelDrag} onMouseOver={this.toggleDrag.bind(this, "true")} onMouseOut={this.toggleDrag.bind(this, "false")} className={this.state.titleBarIsHoveredOver ? "header-title cq-no-drag header-title-hover hidden" : "header-title cq-no-drag"}>{self.state.windowTitle}</div></div>
				<Tab title={self.state.windowTitle} showTabs={self.state.titleBarIsHoveredOver} />
				<div className="fsbl-header-right">
					<BringSuiteToFront />
					{this.state.minButton && showMinimizeIcon ? <Minimize /> : null}
					{showDockingIcon ? <DockingButton /> : null}
					{this.state.maxButton ? <Maximize /> : null}
					{this.state.closeButton ? <Close /> : null}
				</div>
			</div>
		);
	}
}

FSBL.addEventListener("onReady", function () {
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTitleBar />, document.getElementById("FSBLHeader"));
	});
});
