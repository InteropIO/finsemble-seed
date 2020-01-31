
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
// const Test from './test';

import * as storeExports from "./stores/windowTitleBarStore";
let HeaderActions, windowTitleBarStore;

//Parts that make up the windowTitleBar.
//Left side
import Linker from "./components/left/LinkerButton";
import Sharer from "./components/left/ShareButton.jsx";
//Right side
import Minimize from "./components/right/MinimizeButton.jsx";
import DockingButton from "./components/right/DockingButton.jsx";
import Maximize from "./components/right/MaximizeButton.jsx";
import Close from "./components/right/CloseButton.jsx";
import AlwaysOnTop from "./components/right/AlwaysOnTop.jsx";
import AutoHide from "./components/right/AutoHide.jsx";
import TabRegion from './components/center/TabRegion'
import "../../../../assets/css/finsemble.css";
import "../../../../assets/css/_windowTitleBar.css";

/**
 * This is the main window manager component. It's the custom window frame that we add to each window that has useFSBLHeader set to true in its windowDescriptor.
 */
class WindowTitleBar extends React.Component {
	constructor() {
		super();

		this.tabBar = null;
		this.toolbarRight = null;

		this.setTabBarRef = element => {
			this.tabBar = element;
		}

		this.setToolbarRight = element => {
			this.toolbarRight = element;
		}

		this.bindCorrectContext();
		windowTitleBarStore.getValue({ field: "Maximize.hide" });
		this.dragEndTimeout = null;
		let activeIdentifier = finsembleWindow.identifier;
		activeIdentifier.title = windowTitleBarStore.getValue({ field: "Main.windowTitle" });
		this.state = {
			windowTitle: windowTitleBarStore.getValue({ field: "Main.windowTitle" }),
			minButton: !windowTitleBarStore.getValue({ field: "Minimize.hide" }),
			maxButton: !windowTitleBarStore.getValue({ field: "Maximize.hide" }),
			closeButton: !windowTitleBarStore.getValue({ field: "Close.hide" }),
			showLinkerButton: windowTitleBarStore.getValue({ field: "Linker.showLinkerButton" }),
			showShareButton: windowTitleBarStore.getValue({ field: "Sharer.emitterEnabled" }),
			isTopRight: windowTitleBarStore.getValue({ field: "isTopRight" }),
			alwaysOnTopButton: windowTitleBarStore.getValue({ field: "AlwaysOnTop.show" }),
			autoHideButton: windowTitleBarStore.getValue({ field: "AutoHide.show" }),
			tabs: [activeIdentifier], //array of tabs for this window
			showTabs: windowTitleBarStore.getValue({ field: "showTabs" }),
			hackScrollbar: windowTitleBarStore.getValue({ field: "hackScrollbar" }),
			allowDragOnCenterRegion: true,
			activeTab: FSBL.Clients.WindowClient.getWindowIdentifier(),
			tabBarBoundingBox: {}
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
		this.onDockingEnabledChanged = this.onDockingEnabledChanged.bind(this);
		this.onAlwaysOnTopChanged = this.onAlwaysOnTopChanged.bind(this);
		this.onAutoHideChanged = this.onAutoHideChanged.bind(this);
		this.showLinkerButton = this.showLinkerButton.bind(this);
		this.isTopRight = this.isTopRight.bind(this);
		this.allowDragOnCenterRegion = this.allowDragOnCenterRegion.bind(this);
		this.disallowDragOnCenterRegion = this.disallowDragOnCenterRegion.bind(this);

		this.onShareEmitterChanged = this.onShareEmitterChanged.bind(this);
		this.onTabsChanged = this.onTabsChanged.bind(this);
		this.onShowTabsChanged = this.onShowTabsChanged.bind(this);
		this.onHackScrollbarChanged = this.onHackScrollbarChanged.bind(this);
		this.onTilingStop = this.onTilingStop.bind(this);
		this.onTilingStart = this.onTilingStart.bind(this);
		this.resizeDragHandle = this.resizeDragHandle.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);

	}
	componentWillMount() {
		windowTitleBarStore.addListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDockingEnabledChanged },
			{ field: "AlwaysOnTop.show", listener: this.onAlwaysOnTopChanged },
			{ field: "AutoHide.show", listener: this.onAutoHideChanged },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "Sharer.emitterEnabled", listener: this.onShareEmitterChanged },
			{ field: "isTopRight", listener: this.isTopRight },
			{ field: "tabs", listener: this.onTabsChanged },
			{ field: "showTabs", listener: this.onShowTabsChanged },
			{ field: "hackScrollbar", listener: this.onShowTabsChanged },
		]);

		FSBL.Clients.RouterClient.addListener("DockingService.startTilingOrTabbing", this.disallowDragOnCenterRegion);
		//console.log("Adding listener for stopTilingOrTabbing.");
		FSBL.Clients.RouterClient.addListener("DockingService.stopTilingOrTabbing", this.allowDragOnCenterRegion);
		FSBL.Clients.RouterClient.addListener("DockingService.cancelTilingOrTabbing", this.allowDragOnCenterRegion);
	}

	componentDidMount() {
		let header = document.getElementsByClassName("fsbl-header")[0];
		let headerHeight = window.getComputedStyle(header, null).getPropertyValue("height");
		document.body.style.marginTop = headerHeight;
		this.resizeDragHandle();
		this.hackScrollbar();
	}

	componentDidUpdate() {
		this.resizeDragHandle();
	}

	componentWillUnmount() {
		windowTitleBarStore.removeListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDockingEnabledChanged },
			{ field: "AlwaysOnTop.show", listener: this.onAlwaysOnTopChanged },
			{ field: "AutoHide.show", listener: this.onAutoHideChanged },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "Sharer.emitterEnabled", listener: this.onShareEmitterChanged },
			{ field: "isTopRight", listener: this.isTopRight },
			{ field: "tabs", listener: this.onTabsChanged },
			{ field: "showTabs", listener: this.onShowTabsChanged },
			{ field: "hackScrollbar", listener: this.onHackScrollbarChanged },
		]);
		//console.log("Removing listener from the router.");
		FSBL.Clients.RouterClient.removeListener("DockingService.startTilingOrTabbing", this.disallowDragOnCenterRegion);
		FSBL.Clients.RouterClient.removeListener("DockingService.stopTilingOrTabbing", this.allowDragOnCenterRegion);
		FSBL.Clients.RouterClient.removeListener("DockingService.cancelTilingOrTabbing", this.allowDragOnCenterRegion);
	}

	/**
	 * When we are not tiling/tabbing, we want to allow the user to drag the window around via any available space in the tab-region. This function allows that.
	 */
	allowDragOnCenterRegion() {
		//console.log("In stopTilingOrTabbing")
		this.setState({
			allowDragOnCenterRegion: true
		});
	}
	/**
	 * When we are tiling/tabbing, we do not want to allow any window to be dragged around and moved.
	 */
	disallowDragOnCenterRegion() {
		//console.log("No longer allowing drag.")
		this.setState({
			allowDragOnCenterRegion: false
		});
	}

	/**
	 * When tiling start, we want to find the dragHandler and hide it
	 */
	onTilingStart() {
		let dragHandle = document.querySelector('.fsbl-drag-handle');
		if (dragHandle) {
			dragHandle.classList.add('hidden');
		}
	}

	/**
	 * When tiling stops, we want to find the dragHandler and re-show it
	 */
	onTilingStop() {
		let dragHandle = document.querySelector('.fsbl-drag-handle.hidden');
		if (dragHandle) {
			dragHandle.classList.remove('hidden');
		}
	}

	/**
	 * Called whenever a tab is dropped on a non tab area.
	 * It won't be called when dropped on a tab that handles handle the event.
	 */
	onDropHandler() {
		FSBL.Clients.WindowClient.cancelTilingOrTabbing({});
	}
	/**
	 * Called when user double clicks on drag handle
	 */
	onDoubleClick() {
		// Actions.clickMaximize checks the window state
		// and toggles between maximize and minimize.
		HeaderActions.clickMaximize();
	}
	/**
	 * The dragger is an absolutely positioned element that is superimposed on the actual area that we'd like to drag.
	 * This is necessary due to a bug in Chromium. Effectively, we need the dragger to change its left position and width
	 * to match the intended drag area. These dimensions can change whenever the header is re-rendered (for instance when
	 * changing mode from tabbing to non-tabbing). Dimensions can also change when the window itself is resized (due to natural
	 * css).
	 *
	 * TODO, remove all of the cq-drag and cq-no-drag
	 * Remove fsbl-drag-region, it is no longer needed
	 * Hide the dragHandle during drop operations, so that it doesn't interfere
	 */
	resizeDragHandle() {
		const fsblHeader = document.querySelector(".fsbl-header");
		if (!fsblHeader) {
			// If there isn't an FSBLHeader then there doesn't need to be a drag handle.
			return;
		}

		// Create the dragger if it doesn't already exist
		let dragHandle = document.querySelector(".fsbl-drag-handle");
		if (!dragHandle) {
			const currentWindow = fin.desktop.Window.getCurrent();
			dragHandle = document.createElement("div");
			dragHandle.className = "fsbl-drag-handle";
			dragHandle.onmousedown = (e) => {currentWindow.startMovingWindow(e)}
			dragHandle.onmouseup = (e) => {currentWindow.stopMovingWindow(e)}
			dragHandle.ondblclick = () => { this.onDoubleClick(); }
			fsblHeader.insertBefore(dragHandle, fsblHeader.firstChild);
			var self = this;
			window.addEventListener("resize", function () {
				self.resizeDragHandle();
			});
		}

		// Set the height of the dragHandle to match the height of the window title bar
		// Do this every time through the render loop just in case a customer builds a
		// header bar with dynamic height!
		let bounds = fsblHeader.getBoundingClientRect();
		dragHandle.style.height = (bounds.height - 5) + "px"; // Subtract 5 pixels from height in order to make room for resize window cursor at top edge of window
		dragHandle.style.marginTop = (-bounds.height + 5) + "px"; // Negative margin pulls the drag handle up over the fixed header

		// Start logic for determining where to place our dragHandle
		if (this.state.showTabs) {
			// If there is more than one tab, then the drag area is the padding-left of fsbl-header-right
			// See .fsbl-tabs-multiple in the css
			if (this.state.tabs.length > 1) {
				let headerRight = document.querySelector(".fsbl-header-right");
				let computedStyle = getComputedStyle(headerRight);
				bounds = headerRight.getBoundingClientRect();
				// override the bounds.width with the paddingLeft amount
				bounds = {
					left: bounds.left,
					width: parseInt(computedStyle.paddingLeft, 10)
				};
			} else {
				// If tabs are not enabled, then the remained of fsbl-header-center beyond the tabs
				// is the draggable area. This assumes left aligned tabs.
				let fsblHeaderCenter = document.querySelector(".fsbl-header-center");
				bounds = fsblHeaderCenter.getBoundingClientRect();
				let theTabBounds = fsblHeaderCenter.querySelector(".tab-region-wrapper div").getBoundingClientRect();
				// Calculate the right portion
				bounds = {
					left: bounds.left + theTabBounds.width,
					width: bounds.width - theTabBounds.width
				};
			}
		} else {
			// If tabs are not enabled, then the entire center is the drag area
			bounds = document.querySelector(".fsbl-header-center").getBoundingClientRect();
		}
		dragHandle.style.left = bounds.left + "px";
		dragHandle.style.width = bounds.width + "px";

		//Add an event listener to hide the drag-handler when tiling is started
		FSBL.Clients.RouterClient.addListener("DockingService.startTilingOrTabbing", this.onTilingStart);

		//Add an event listener to show the drag-handler when tiling is stopped or cancelled
		FSBL.Clients.RouterClient.addListener("DockingService.stopTilingOrTabbing", this.onTilingStop);
		FSBL.Clients.RouterClient.addListener("DockingService.cancelTilingOrTabbing", this.onTilingStop);
	}

	/**
	 * Whether the component's config allows for the linker.
	 * @param {} err
	 * @param {*} response
	 */
	showLinkerButton(err, response) {
		//console.log("showLinkerButton--", response)
		this.setState({ showLinkerButton: response.value });
	}
	/**
	 * Whether the window is the top-right-most window in a group of windows. If so, it renders a minimize icon for the whole group.
	 * @param {} err
	 * @param {*} response
	 */
	isTopRight(err, response) {
		this.setState({ isTopRight: response.value });
	}
	/**
	 * @todo generalize. We'll need to capture title changes from every window in our stack.
	 * @param {*} err
	 * @param {*} response
	 */
	onTitleChange(err, response) {
		let { tabs } = this.state;
		let myIdentifier = FSBL.Clients.WindowClient.getWindowIdentifier();
		
		tabs = tabs.map((el) => {
			if (!el.windowName && el.name) el.windowName = el.name;
			if (!el.name && el.windowName) el.name = el.windowName;
			return el;
		});

		const myIndex = tabs.findIndex(el => el.name === myIdentifier.windowName);
		if (myIndex === -1) return;

		let myTab = tabs[myIndex] || {};
		myTab.title = response.value;
		tabs.splice(myIndex, 1, myTab);

		this.setState({
			windowTitle: response.value,
			tabs: tabs
		});
	}

	/**
	 * The next few methods are store change handlers that sync local state with the store's state.
	 */
	onShowDockingToolTip(err, response) {
		this.setState({ showDockingTooltip: response.value });
	}
	onToggleDockingIcon(err, response) {
		this.setState({
			dockingIcon: response.value
		});
	}
	onDockingEnabledChanged(err, response) {
		this.setState({ dockingEnabled: response.value });
	}
	onAlwaysOnTopChanged(err, response) {
		this.setState({ alwaysOnTopButton: response.value });
	}
	onAutoHideChanged(err, response) {
		this.setState({ autoHideButton: response.value });
	}
	onStoreChanged(newState) {
		this.setState(newState);
	}
	onShareEmitterChanged(err, response) {
		this.setState({ showShareButton: response.value });
	}

	onTabsChanged(err, response) {
		this.setState({
			tabs: response.value
		})
	}

	onShowTabsChanged(err, response) {
		this.setState({
			showTabs: response.value
		})
	}

	onHackScrollbarChanged(err, response) {
		this.setState({
			hackScrollbar: response.value
		});
		hackScrollbar();
	}

	// Hack the window's scrollbar so that it displays underneath the header. html.overflow: hidden body.overflow:auto
	// This is turned on by default. Set "Window Manager.hackScrollbar: false" to turn it off
	hackScrollbar() {
		if (this.state.hackScrollbar) {
			document.querySelector("html").style.overflowY = "hidden";
			document.querySelector("body").style.overflowY = "auto";
		}
	}

	render() {
		var self = this;
		const RENDER_LEFT_SECTION = this.state.showLinkerButton || this.state.showShareButton;
		let showDockingIcon = !self.state.dockingEnabled ? false : self.state.dockingIcon;
		let isGrouped = (self.state.dockingIcon == "ejector");
		let showMinimizeIcon = (isGrouped && self.state.isTopRight) || !isGrouped; //If not in a group or if topright in a group
		let titleWrapperClasses = "fsbl-header-center";
		let rightWrapperClasses = "fsbl-header-right";
		let tabRegionClasses = "fsbl-tab-area";
		let headerClasses = "fsbl-header";

		//If we're showing tabs, we throw these classes on to modify styles.
		if (this.state.showTabs) {
			headerClasses += " fsbl-tabs-enabled";
		}
		if (this.state.tabs.length > 1) {
			headerClasses += " fsbl-tabs-multiple";
		}
		//See this.allowDragOnCenterRegion for more explanation.
		return (
			<div className={headerClasses} onDrop={this.onDropHandler.bind(this)}>
				{/* Only render the left section if something is inside of it. The left section has a right-border that we don't want showing willy-nilly. */}
				{RENDER_LEFT_SECTION &&
					<div className="fsbl-header-left">
						{self.state.showLinkerButton ? <Linker /> : null}
						{self.state.showShareButton ? <Sharer /> : null}
					</div>
				}
				{/* center section of the titlebar */}
				<div className={titleWrapperClasses}
					ref={this.setTabBarRef}>
					{/* If we're supposed to show tabs and the window isn't babySized */}
					{!this.state.showTabs && <div className='fsbl-header-center'>{this.state.windowTitle}</div>}
					{this.state.showTabs &&
						<TabRegion
							onTabDropped={this.allowDragOnCenterRegion}
							className={tabRegionClasses}
							thisWindowsTitle={this.state.windowTitle}
							boundingBox={this.state.tabBarBoundingBox}
							listenForDragOver={!this.state.allowDragOnCenterRegion}
							tabs={this.state.tabs}
							ref="tabArea"
							onTitleUpdated={this.resizeDragHandle}
						/>}

				</div>
				<div className={rightWrapperClasses} ref={this.setToolbarRight}>
					{showDockingIcon ? <DockingButton /> : null}
					{/** DH 11/22/2019
					 * Because AlwaysOnTop is a "smart" component that registers
					 * event handlers, etc., it's not a good idea to constantly mount
					 * and unmount it. To prevent this, we pass in a "visible" prop that,
					 * if false, sets "display: none". Ideally, AlwaysOnTop should be a "dumb"
					 * component, and all the event handlers, etc. should be registered in a parent component,
					 * as this simplifies the UI and allows React to better optimize under the hood.
					 */}
					<AlwaysOnTop visible={this.state.alwaysOnTopButton && showMinimizeIcon}/>
					<AutoHide visible={this.state.autoHideButton}/>
					{this.state.minButton && showMinimizeIcon ? <Minimize /> : null}
					{this.state.maxButton ? <Maximize /> : null}
					{this.state.closeButton ? <Close /> : null}
				</div>
			</div>
		);
	}
}

function init () {
	// The following line fixes the CSS issues, weird..
	const css = require("../../../../assets/css/finsemble.css");
	// Create the header element
	const template = document.createElement("div");
	const FSBLHeader = document.createElement('div')
		  FSBLHeader.setAttribute('id', 'FSBLHeader')
	template.appendChild(FSBLHeader)
	document.body.insertBefore(template.firstChild, document.body.firstChild);
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTitleBar />, FSBLHeader);
		// Register with docking manager
		FSBL.Clients.WindowClient.registerWithDockingManager();
	});
}

// we do not need to wait for FSBL ready because this file gets required after FSBL is ready.
init();
