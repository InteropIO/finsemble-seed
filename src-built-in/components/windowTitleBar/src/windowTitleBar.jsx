
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
import AlwaysOnTop from "./components/right/AlwaysOnTop.jsx";
import TabRegion from './components/center/TabRegion'
import "../../assets/css/finsemble.css";

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
			tabs: [activeIdentifier], //array of tabs for this window
			showTabs: windowTitleBarStore.getValue({ field: "showTabs" }),
			allowDragOnCenterRegion: true,
			activeTab: activeIdentifier,
			tabBarBoundingBox: {},
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
		this.showLinkerButton = this.showLinkerButton.bind(this);
		this.isTopRight = this.isTopRight.bind(this);
		this.allowDragOnCenterRegion = this.allowDragOnCenterRegion.bind(this);
		this.disallowDragOnCenterRegion = this.disallowDragOnCenterRegion.bind(this);

		this.onShareEmitterChanged = this.onShareEmitterChanged.bind(this);
		this.onTabsChanged = this.onTabsChanged.bind(this);
		this.onShowTabsChanged = this.onShowTabsChanged.bind(this);

	}
	componentWillMount() {
		windowTitleBarStore.addListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDockingEnabledChanged },
			{ field: "AlwaysOnTop.show", listener: this.onAlwaysOnTopChanged },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "Sharer.emitterEnabled", listener: this.onShareEmitterChanged },
			{ field: "isTopRight", listener: this.isTopRight },
			{ field: "tabs", listener: this.onTabsChanged },
			{ field: "showTabs", listener: this.onShowTabsChanged },
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
	}

	componentWillUnmount() {
		windowTitleBarStore.removeListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDockingEnabledChanged },
			{ field: "AlwaysOnTop.show", listener: this.onAlwaysOnTopChanged },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "Sharer.emitterEnabled", listener: this.onShareEmitterChanged },
			{ field: "isTopRight", listener: this.isTopRight },
			{ field: "tabs", listener: this.onTabsChanged },
			{ field: "showTabs", listener: this.onShowTabsChanged },
		]);
		//console.log("Removing listener from the router.");
		FSBL.Clients.RouterClient.removeListener("DockingService.startTilingOrTabbing", this.disallowDragOnCenterRegion);
		FSBL.Clients.RouterClient.removeListener("DockingService.stopTilingOrTabbing", this.allowDragOnCenterRegion);
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
		let myIndex = -1;
		let myTab = tabs.filter((el, i) => {
			if (!el.windowName && el.name) el.windowName = el.name;
			if (!el.name && el.windowName) el.name = el.windowName;

			if (el.name === myIdentifier.windowName) {
				myIndex = i;
				return true;
			}
			return false;
		})[0]
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

	render() {
		var self = this;
		const RENDER_LEFT_SECTION = this.state.showLinkerButton || this.state.showShareButton;
		let showDockingIcon = !self.state.dockingEnabled ? false : self.state.dockingIcon;
		let isGrouped = (self.state.dockingIcon == "ejector");
		let showMinimizeIcon = (isGrouped && self.state.isTopRight) || !isGrouped; //If not in a group or if topright in a group
		let titleWrapperClasses = "fsbl-header-center";
		let rightWrapperClasses = "fsbl-header-right cq-drag";
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
		// When using tabs, we'll rely on fsbl-drag-region instead of adding cq-drag directly
		if (this.state.allowDragOnCenterRegion && !this.state.showTabs) {
			titleWrapperClasses += " cq-drag";
			//tabRegionClasses += " cq-drag";
		}
		return (
			<div className={headerClasses}>
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
					{/* If we're suppsoed to show tabs and the window isn't babySized */}
					{!this.state.showTabs && <div className='fsbl-header-center cq-drag'>{this.state.windowTitle}</div>}
					{this.state.showTabs && <div className="fsbl-drag-region"></div>}
					{this.state.showTabs &&
						<TabRegion
							onTabDropped={this.allowDragOnCenterRegion}
							className={tabRegionClasses}
							thisWindowsTitle={this.state.windowTitle}
							boundingBox={this.state.tabBarBoundingBox}
							listenForDragOver={!this.state.allowDragOnCenterRegion}
							tabs={this.state.tabs}
							ref="tabArea"
						/>}

				</div>
				<div className={rightWrapperClasses} ref={this.setToolbarRight}>
					{this.state.alwaysOnTopButton && showMinimizeIcon ? <AlwaysOnTop /> : null}
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

// This is how we used to do it, but this was causing timing problems in windows that
// reload, such as Symphony. FSBL.addEventListener() is a better approach because
// it is pub/sub, if the event had fired in the past then it will still be fired.
// window.addEventListener("FSBLReady", function () {

FSBL.addEventListener("onReady", function () {
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTitleBar />, document.getElementById("FSBLHeader"));
	});
});