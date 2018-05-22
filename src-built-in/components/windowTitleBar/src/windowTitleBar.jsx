
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
const TAB_WIDTH = 175;
const MINIMUM_TAB_SIZE = 55;
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
		this.state = {
			windowTitle: windowTitleBarStore.getValue({ field: "Main.windowTitle" }),
			minButton: !windowTitleBarStore.getValue({ field: "Minimize.hide" }),
			maxButton: !windowTitleBarStore.getValue({ field: "Maximize.hide" }),
			closeButton: !windowTitleBarStore.getValue({ field: "Close.hide" }),
			showLinkerButton: windowTitleBarStore.getValue({ field: "Linker.showLinkerButton" }),
			showShareButton: windowTitleBarStore.getValue({ field: "Sharer.emitterEnabled" }),
			isTopRight: windowTitleBarStore.getValue({ field: "isTopRight" }),
			alwaysOnTopButton: windowTitleBarStore.getValue({ field: "AlwaysOnTop.show" }),
			tabWidth: TAB_WIDTH,
			tabs: [{ title: windowTitleBarStore.getValue({ field: "Main.windowTitle" }) }], //array of tabs for this window
			showTabs: false,
			allowDragOnCenterRegion: true,
			activeTab: FSBL.Clients.WindowClient.getWindowIdentifier(),
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
		this.onWindowResize = this.onWindowResize.bind(this);
		this.allowDragOnCenterRegion = this.allowDragOnCenterRegion.bind(this);
		this.disallowDragOnCenterRegion = this.disallowDragOnCenterRegion.bind(this);

		this.onShareEmitterChanged = this.onShareEmitterChanged.bind(this);
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
		]);

		FSBL.Clients.ConfigClient.getValue({ field: "finsemble" }, (err, config) => {
			let windowManager = config['Window Manager'];
			this.setState({
				showTabs: typeof config['Window Manager'] !== undefined ? config['Window Manager'].showTabs : false
			});
		})

		FSBL.Clients.RouterClient.addListener("DockingService.startTilingOrTabbing", this.disallowDragOnCenterRegion);
		FSBL.Clients.RouterClient.addListener("DockingService.stopTilingOrTabbing", this.allowDragOnCenterRegion);
	}

	componentDidMount() {
		let header = document.getElementsByClassName("fsbl-header")[0];
		let headerHeight = window.getComputedStyle(header, null).getPropertyValue("height");
		document.body.style.marginTop = headerHeight;
		this.resize = setTimeout(this.onWindowResize, 300);
		window.addEventListener('resize', this.onWindowResize);

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
		]);
		window.removeEventListener('resize', this.onWindowResize);
		FSBL.Clients.RouterClient.removeListener("DockingService.startTilingOrTabbing", this.disallowDragOnCenterRegion);
		FSBL.Clients.RouterClient.removeListener("DockingService.stopTilingOrTabbing", this.allowDragOnCenterRegion);
	}

	/**
	 * When we are not tiling/tabbing, we want to allow the user to drag the window around via any available space in the tab-region. This function allows that.
	 */
	allowDragOnCenterRegion() {
		console.log("In stopTilingOrTabbing")
		this.setState({
			allowDragOnCenterRegion: true
		});
	}
	/**
	 * When we are tiling/tabbing, we do not want to allow any window to be dragged around and moved.
	 */
	disallowDragOnCenterRegion() {
		console.log("No longer allowing drag.")
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
			if (el.name === myIdentifier.name && el.uuid === myIdentifier.uuid) {
				myIndex = i;
				return true;
			}
			return false;
		});
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
		this.setState({ emitterEnabled: response.value });
	}
	/**
	 * Resize handler. Calculates the space that the center-region is taking up. May be used to scale tabs proportionally.
	 */
	onWindowResize() {
		clearTimeout(this.resize);
		this.resize = null;
		let bounds = this.tabBar.getBoundingClientRect();
		this.setState({
			tabBarBoundingBox: bounds
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

		//If we're showing tabs, we throw these classes on to modify styles.
		if (this.state.showTabs) {
			titleWrapperClasses += " fsbl-tabs-enabled";
			rightWrapperClasses += " fsbl-tabs-enabled";
		}
		//See this.allowDragOnCenterRegion for more explanation.
		if (this.state.allowDragOnCenterRegion) {
			titleWrapperClasses += " cq-drag";
			tabRegionClasses += " cq-drag";
		}

		return (
			<div className="fsbl-header">
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
					{this.state.showTabs && this.state.tabWidth >= MINIMUM_TAB_SIZE &&
						<TabRegion
							onTabDropped={this.allowDragOnCenterRegion}
							className={tabRegionClasses}
							thisWindowsTitle={this.state.windowTitle}
							boundingBox={this.state.tabBarBoundingBox}
							listenForDragOver={!this.state.allowDragOnCenterRegion}
							tabs={this.state.tabs}
							tabWidth={this.state.tabWidth}
							ref="tabArea"
							onWindowResize={this.onWindowResize}
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

window.addEventListener("FSBLReady", function () {
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTitleBar />, document.getElementById("FSBLHeader"));
	});
});
