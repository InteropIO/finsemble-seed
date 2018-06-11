/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.css";
import "../floatingHeader.css";
import { Actions as HeaderActions, Store as HeaderStore } from "./stores/headerStore";
import TabbingSection from "./components/Tabbing";
import * as storeExports from "./stores/tabbingStore";

let dragFromActionBar = false;
let isDragging = false;
let lastDragEventLeave = false;
let hover = false;
/**
 * This is our application launcher. It is opened from a button in our sample toolbar, and it handles the launching of finsemble components.
 *
 * @class AppLauncher
 * @extends {React.Component}
 */
class FloatingHeader extends React.Component {
	constructor(props) {
		super(props);
		this.finWindow = fin.desktop.Window.getCurrent();
		this.state = {
			loaded: false,
			headerImgUrl: "",
			size: "small",
			tabs: [],
			openedByClick: false,
			dragFromActionBar: false,
			expandedComplete: false,
			hasTabs: storeExports.Actions.getTabs().length
		};
		this.onActionClick = this.onActionClick.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onTabsUpdated = this.onTabsUpdated.bind(this);
		this.contractWindow = this.contractWindow.bind(this);
		this.expandWindow = this.expandWindow.bind(this);
		this.onWindowUpdateExpandComplete = this.onWindowUpdateExpandComplete.bind(this);

	}

	componentWillMount() {
		storeExports.Store.addListener({ field: "tabs" }, this.onTabsUpdated);
		HeaderStore.addListener("tabRegionShow", this.onWindowUpdateExpandComplete)
	}
	componentWillunMount() {
		storeExports.Store.removeListener({ field: "tabs" }, this.onTabsUpdated);
		HeaderStore.removeListener("tabRegionShow", this.onWindowUpdateExpandComplete)
	}
	onWindowUpdateExpandComplete(data) {
		console.log("onWindowUpdateExpandComplete", lastDragEventLeave, hover)
		if (lastDragEventLeave && hover) {

			console.log("set hover false1");

			HeaderActions.isMouseInHeader(function (err, isInHeader) {
				if (!isInHeader) {
					hover = false;
					lastDragEventLeave = false;
					self.contractWindow();
				}
			})
		}
		this.setState({ expandedComplete: true })
	}
	onDragStart(e) {
		isDragging = true;
		console.log("drag start", storeExports)
		dragFromActionBar = true;
		e.dataTransfer.setData("text/json", JSON.stringify(storeExports.Actions.getWindowIdentifier()));
		FSBL.Clients.WindowClient.startTilingOrTabbing({
			windowIdentifier: storeExports.Actions.getWindowIdentifier()
		});

		//this.setState({ dragFromActionBar: true })
	}
	onDragEnd(e) {
		console.log("onDragEnd")
		dragFromActionBar = false;
		isDragging = false;
		FSBL.Clients.Logger.system.debug("Tab drag stop");
		//@sidd can you document this?
		var mousePositionOnDragEnd = {
			x: e.nativeEvent.screenX,
			y: e.nativeEvent.screenY
		}
		let boundingRect = this.state.boundingBox;
		if (!FSBL.Clients.WindowClient.isPointInBox(mousePositionOnDragEnd, FSBL.Clients.WindowClient.options)) {
			console.log("stop tiling", mousePositionOnDragEnd)
			FSBL.Clients.WindowClient.stopTilingOrTabbing({ mousePosition: mousePositionOnDragEnd });

			//this.onWindowResize();
		}
	}
	onComponentDidMount() {
		console.log("onComponentDidMount")

	}
	onComponentDidUpdate() {
	}
	onTabsUpdated() {

		let tabs = storeExports.Actions.getTabs();
		console.log("tabs updated", storeExports.Actions.getTabs())
		if (tabs && tabs.length) {

			return this.setState({ hasTabs: true })
		}
		this.setState({ hasTabs: false })
	}
	onMouseUp(e) {
		console.log("onMouseUp")
	}
	onMouseMove(e) {
		//console.log("onMouseMove")
	}
	onDragOver(e) {
		console.log("dragover", this.state.size)
		hover = true;
		if (this.state.size === "small") {
			this.expandWindow()

		}
	}
	onDrop(e) {
		console.log("onDrop")
	}
	contractWindow() {
		console.log("contractWindow");
		var self = this;
		HeaderActions.contractWindow(function () {
			self.setState({ size: "small" })
		})
	}
	expandWindow() {
		console.log("expandWindow")
		this.setState({ expandedComplete: false, size: "large" })
		HeaderActions.expandWindow(function () {
		})
	}
	onActionClick(event, openedByClick) {
		console.log("hover", hover)
		if (isDragging) return;
		if (event) {
			event.stopPropagation();
			event.nativeEvent.stopImmediatePropagation();
		}

		var self = this;
		this.state.size === "small" ? this.expandWindow() : this.contractWindow();

	}
	render() {
		let headerClasses = "fsbl-header fsbl-tabs-enabled";
		//If we're showing tabs, we throw these classes on to modify styles.
		if (this.state.showTabs) {
			headerClasses += " fsbl-tabs-enabled";
		}
		if (this.state.tabs.length > 1) {
			headerClasses += " fsbl-tabs-multiple";
		}
		let actionClasses = "actionButton"
		let title = storeExports.Actions.getWindowIdentifier().windowName
		var self = this;
		if (this.state.size === "small") {

			if (this.state.hasTabs) {
				actionClasses += " tabs-expand";
				title = "";

			}

			return <div onClickCapture={(e) => { self.onActionClick(e, true) }}
				onDragOver={this.onDragOver} onDropCapture={this.ondrop} draggable="true"
				onDragEnd={this.onDragEnd} onDragStart={this.onDragStart} className="headerContainer" >
				<div className={actionClasses}>{title}</div>
			</div >
		}

		return <div className={headerClasses} onDragEnter={function () {
			lastDragEventLeave = false;
		}} onDragLeave={function (e) {
			lastDragEventLeave = true;
			if (!self.state.expandedComplete || !hover) return;



			HeaderActions.isMouseInHeader(function (err, isInHeader) {
				if (!isInHeader) {
					hover = false;
					lastDragEventLeave = false;
					self.contractWindow();
				}
			})
		}} >
			<div id="actionbutton" onClickCapture={function (e) { self.onActionClick(e, false) }} className="actionButton tabs-contract"></div>
			<TabbingSection />

		</div >
	}
}

fin.desktop.main(function () {
	FSBL.addEventListener("onReady", function () {
		HeaderActions.initialize(function () {
			storeExports.initialize(HeaderStore.getCompanionWindow(), function () {
				storeExports.Actions.setWindowIdentifier(HeaderStore.getCompanionWindow().identifier)
				console.log("render time")
				ReactDOM.render(
					<FloatingHeader />
					, document.getElementById("bodyHere"));
			})
		});
	});
});