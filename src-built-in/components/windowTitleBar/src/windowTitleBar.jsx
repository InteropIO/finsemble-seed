
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
import Tab from './tab.jsx'
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
		this.state = {
			windowTitle: windowTitleBarStore.getValue({ field: "Main.windowTitle" }),
			minButton: !windowTitleBarStore.getValue({ field: "Minimize.hide" }),
			maxButton: !windowTitleBarStore.getValue({ field: "Maximize.hide" }),
			closeButton: !windowTitleBarStore.getValue({ field: "Close.hide" }),
			showLinkerButton: windowTitleBarStore.getValue({ field: "Linker.showLinkerButton" }),
			isTopRight: windowTitleBarStore.getValue({ field: "isTopRight" }),
			alwaysOnTopButton: windowTitleBarStore.getValue({ field: "AlwaysOnTop.show" }),
			tabWidth: 175,
			tabs: [{ title: windowTitleBarStore.getValue({ field: "Main.windowTitle" }) }], //array of tabs for this window
			showTabs: false
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
		this.toggleDrag = this.toggleDrag.bind(this);
		this.startDrag = this.startDrag.bind(this);
		this.stopDrag = this.stopDrag.bind(this);
		this.cancelTabbing = this.cancelTabbing.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		this.clearDragEndTimeout = this.clearDragEndTimeout.bind(this);
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
				showTabs: typeof config['Window Manager'] !== undefined ? config['Window Manager'].showTabs : false
			});
		})
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

	/**
	 * Handles mouseover of title bar. This turns the regular title to a tab on windows that aren't already tabbing.
	 * This function is used as a prop on HoverDetector
	 *
	 * @memberof windowTitleBar
	 */
	toggleDrag() {
	}

	/**
	 * Function that's called when this component fires the onDragStart event, this will start the tiling or tabbing process
	 *
	 * @param e The SyntheticEvent created by React when the startdrag event is called
	 * @memberof windowTitleBar
	 */
	startDrag(e) {
		FSBL.Clients.WindowClient.startTilingOrTabbing({ windowIdentifier: FSBL.Clients.WindowClient.getWindowIdentifier() });

	}

	/**
	 * Called when the react component detects a drop (or stop drag, which is equivalent)
	 *
	 * @param e The SyntheticEvent created by React when the stopdrag event is called
	 * @memberof windowTitleBar
	 */
	stopDrag(e) {
		this.mousePositionOnDragEnd = {
			x: e.nativeEvent.screenX,
			y: e.nativeEvent.screenY
		}
		this.dragEndTimeout = setTimeout(this.clearDragEndTimeout, 300);
		FSBL.Clients.RouterClient.addListener('tabbingDragEnd', this.clearDragEndTimeout);
	}

	clearDragEndTimeout(err, response) {
		clearTimeout(this.dragEndTimeout);
		if (!response) {
			FSBL.Clients.WindowClient.stopTilingOrTabbing({ mousePosition: this.mousePositionOnDragEnd });
			this.onWindowResize();
		}
		FSBL.Clients.RouterClient.removeListener('tabbingDragEnd', this.clearDragEndTimeout);
	}
	/**
	 * Set to a timeout. An event is sent to the RouterClient which will be handled by the drop handler on the window.
	 * In the event that a drop handler never fires to stop tiling or tabbing, this will take care of it.
	 *
	 * @memberof windowTitleBar
	 */
	cancelTabbing() {
		FSBL.Clients.WindowClient.stopTilingOrTabbing();
		this.onWindowResize();
	}

	onWindowResize() {
		this.resize = null;
		let bounds = this.tabBar.getBoundingClientRect();
		let toolbarRightBounds = this.toolbarRight.getBoundingClientRect();
		let newWidth = bounds.width <= this.state.tabWidth + toolbarRightBounds.width ? ((bounds.width - 10) / this.state.tabs.length) + 10 : 175;
		if (newWidth >= 175) newWidth = 175;
		this.setState({
			tabWidth: newWidth
		})
	}

	render() {
		var self = this;

		let showDockingIcon = !self.state.dockingEnabled ? false : self.state.dockingIcon;
		let isGrouped = (self.state.dockingIcon == "ejector");
		let showMinimizeIcon = (isGrouped && self.state.isTopRight) || !isGrouped; //If not in a group or if topright in a group
		let titleWrapperClasses = "fsbl-header-center cq-drag";
		if (this.state.showTabs) {
			titleWrapperClasses += " fsbl-tabs-enabled";
		}

		return (
			<div className="fsbl-header">
				<div className="fsbl-header-left">
					{self.state.showLinkerButton ? <Linker /> : null}
					<Sharer />
				</div>
				<div className={titleWrapperClasses} onMouseEnter={this.toggleDrag} onMouseLeave={this.toggleDrag} ref={this.setTabBarRef}>
					<div className={"fsbl-header-title"}>{self.state.windowTitle}</div>

					{this.state.showTabs &&
						<div className={"fsbl-tab-area cq-no-drag"} draggable="true" onDragStart={this.startDrag} onDragEnd={this.stopDrag} onDrop={this.drop} ref="tabArea">
							{this.state.tabWidth >= 55 ?
								this.state.tabs.map((tab, i) => {
									return <Tab key={i} tabWidth={this.state.tabWidth} title={tab.title} />
								}) :
								null}
						</div>
					}
				</div>
				<div className="fsbl-header-right" ref={this.setToolbarRight}>
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
