
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
const MINIMUM_TAB_WIDTH = 175;
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
			isTopRight: windowTitleBarStore.getValue({ field: "isTopRight" }),
			alwaysOnTopButton: windowTitleBarStore.getValue({ field: "AlwaysOnTop.show" }),
			tabWidth: MINIMUM_TAB_WIDTH,
			tabs: [{ title: windowTitleBarStore.getValue({ field: "Main.windowTitle" }) }], //array of tabs for this window
			showTabs: false,
			allowDragOnCenterRegion: true,
			activeTab: null,
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
		this.onDocking = this.onDocking.bind(this);
		this.onAlwaysOnTop = this.onAlwaysOnTop.bind(this);
		this.showLinkerButton = this.showLinkerButton.bind(this);
		this.isTopRight = this.isTopRight.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		this.allowDragOnCenterRegion = this.allowDragOnCenterRegion.bind(this);
		this.disallowDragOnCenterRegion = this.disallowDragOnCenterRegion.bind(this);
		this.setActiveTab = this.setActiveTab.bind(this);
		this.onTabAdded = this.onTabAdded.bind(this);
		this.onTabClosed = this.onTabClosed.bind(this);
	}
	componentWillMount() {
		windowTitleBarStore.addListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDocking },
			{ field: "AlwaysOnTop.show", listener: this.onAlwaysOnTop },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "isTopRight", listener: this.isTopRight },
		]);

		FSBL.Clients.ConfigClient.getValue({ field: "finsemble" }, (err, config) => {
			let windowManager = config['Window Manager'];
			this.setState({
				// showTabs: typeof config['Window Manager'] !== undefined ? config['Window Manager'].showTabs : false
				showTabs: true
			});
		})
		this.getFakeTabs();
		FSBL.Clients.RouterClient.addListener("DockingService.startTilingOrTabbing", this.disallowDragOnCenterRegion);
		FSBL.Clients.RouterClient.addListener("DockingService.stopTilingOrTabbing", this.allowDragOnCenterRegion);
	}

	componentWillUnmount() {
		windowTitleBarStore.removeListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDocking },
			{ field: "AlwaysOnTop.show", listener: this.onAlwaysOnTop },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "isTopRight", listener: this.isTopRight },
		]);
		window.removeEventListener('resize', this.onWindowResize);
		FSBL.Clients.RouterClient.removeListener("DockingService.startTilingOrTabbing", this.disallowDragOnCenterRegion);
		FSBL.Clients.RouterClient.removeListener("DockingService.stopTilingOrTabbing", this.allowDragOnCenterRegion);
	}

	allowDragOnCenterRegion() {
		this.setState({
			allowDragOnCenterRegion: true
		});
	}

	disallowDragOnCenterRegion() {
		this.setState({
			allowDragOnCenterRegion: false
		});
	}

	getFakeTabs() {
		FSBL.Clients.LauncherClient.getActiveDescriptors((err, response) => {
			//Only keep welcomeComponents. Return an array of window identifiers.
			// let welcomeComponents = Object.keys(response).map(name => {
			// 	return response[name];
			// }).filter(descriptor => {
			// 	return descriptor.customData.component.type === "Welcome Component"
			// }).map(descriptor => {
			// 	return {
			// 		windowName: descriptor.name,
			// 		componentType: descriptor.customData.component.type,
			// 		uuid: descriptor.uuid
			// 	}
			// });

			this.setState({
				tabs: [FSBL.Clients.WindowClient.getWindowIdentifier()]
			});
		});
	}

	componentDidMount() {
		let header = document.getElementsByClassName("fsbl-header")[0];
		let headerHeight = window.getComputedStyle(header, null).getPropertyValue("height");
		document.body.style.marginTop = headerHeight;
		this.resize = setTimeout(this.onWindowResize, 300);
		window.addEventListener('resize', this.onWindowResize);

	}

	showLinkerButton(err, response) {
		//console.log("showLinkerButton--", response)
		this.setState({ showLinkerButton: response.value });
	}

	isTopRight(err, response) {
		this.setState({ isTopRight: response.value });
	}

	onTitleChange(err, response) {
		FSBL.Clients.LauncherClient.
			this.setState({
				windowTitle: response.value,
				tabs: [{ title: windowTitleBarStore.getValue({ field: "Main.windowTitle" }) }]
			});
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
	onAlwaysOnTop(err, response) {
		this.setState({ alwaysOnTopButton: response.value });
	}
	onStoreChanged(newState) {
		this.setState(newState);
	}

	onWindowResize() {
		this.resize = null;
		let bounds = this.tabBar.getBoundingClientRect();
		let toolbarRightBounds = this.toolbarRight.getBoundingClientRect();
		let newWidth = bounds.width - 30;
		if (this.state.tabs.length > 1) {
			newWidth = MINIMUM_TAB_WIDTH;
		}

		this.setState({
			tabWidth: newWidth,
			tabBarBoundingBox: bounds
		})
	}

	setActiveTab(tab) {
		this.setState({ activeTab: tab })
	}
	onTabAdded(identifier) {
		let { tabs } = this.state;
		tabs.push(identifier);
		//Once we have more than one tab, we enforce a fixed tab width.
		let tabWidth = MINIMUM_TAB_WIDTH;
		this.setState({ tabs, tabWidth });
	}

	onTabClosed(identifier) {
		let i = this.state.tabs.findIndex(el => el.name === identifier && el.uuid === identifier);
		let { tabs } = this.state;
		tabs.splice(i, 1);
		this.setState({ tabs });
	}

	render() {
		var self = this;

		let showDockingIcon = !self.state.dockingEnabled ? false : self.state.dockingIcon;
		let isGrouped = (self.state.dockingIcon == "ejector");
		let showMinimizeIcon = (isGrouped && self.state.isTopRight) || !isGrouped; //If not in a group or if topright in a group
		let titleWrapperClasses = "fsbl-header-center";
		let rightWrapperClasses = "fsbl-header-right cq-drag";
		let tabRegionClasses = "fsbl-tab-area";
		if (this.state.showTabs) {
			titleWrapperClasses += " fsbl-tabs-enabled";
			rightWrapperClasses += " fsbl-tabs-enabled";
		}

		if (this.state.allowDragOnCenterRegion) {
			titleWrapperClasses += " cq-drag";
			tabRegionClasses += " cq-drag";
		}

		return (
			<div className="fsbl-header">
				<div className="fsbl-header-left">
					{self.state.showLinkerButton ? <Linker /> : null}
					<Sharer />
				</div>
				<div className={titleWrapperClasses} onMouseEnter={this.toggleDrag} onMouseLeave={this.toggleDrag} ref={this.setTabBarRef}>
					{this.state.tabs.length == 0 &&
						<div className={"fsbl-header-title"}> {self.state.windowTitle}</div>}

					{this.state.showTabs && this.state.tabWidth >= 55 &&
						<TabRegion
						boundingBox={this.state.tabBarBoundingBox}
						listenForDragOver={!this.state.allowDragOnCenterRegion}
						className={tabRegionClasses}
						onWindowResize={this.onWindowResize}
						setActiveTab={this.setActiveTab}
						activeTab={this.state.activeTab}
						onTabAdded={this.onTabAdded}
						onTabClosed={this.onTabClosed}
						ref="tabArea"
						tabs={this.state.tabs}
						tabWidth={this.state.tabWidth}/>}

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

FSBL.addEventListener("onReady", function () {
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTitleBar />, document.getElementById("FSBLHeader"));
	});
});
