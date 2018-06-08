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
			dragFromActionBar: false
		};
		this.onActionClick = this.onActionClick.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragStart = this.onDragStart.bind(this);

	}

	componentWillMount() {

	}
	componentWillunMount() {

	}
	onDragStart(e) {
		isDragging = true;
		console.log("drag start", storeExports)
		e.dataTransfer.setData("text/json", JSON.stringify(storeExports.Actions.getWindowIdentifier()));
		FSBL.Clients.WindowClient.startTilingOrTabbing({
			windowIdentifier: storeExports.Actions.getWindowIdentifier()
		});
		dragFromActionBar = true;
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
		//document.getElementById("actionbutton").addEventListener("click", this.onActionClick, true)
	}
	onComponentDidUpdate() {
		//document.getElementById("actionbutton").addEventListener("click", this.onActionClick, true)
	}
	onMouseUp(e) {
		console.log("onMouseUp")
	}
	onMouseMove(e) {
		//console.log("onMouseMove")
	}
	onDragOver(e) {
		console.log("dragover")
		if (this.state.size === "small") {
			this.onActionClick(false)
		}
	}
	onActionClick(event, openedByClick) {
		console.log("onActionClick", event, openedByClick, isDragging);
		if (isDragging) return;
		if (event) {
			event.stopPropagation();
			event.nativeEvent.stopImmediatePropagation();
			console.log("stopPropagation", event.isPropagationStopped())
		}

		var self = this;
		var wasSmall = this.state.size === "small" ? true : false;
		if (wasSmall) {
			self.setState({ size: this.state.size === "small" ? "large" : "small", openedByClick: openedByClick })
		}
		HeaderActions.updateWindowState(function () {
			if (!wasSmall) self.setState({ size: self.state.size === "small" ? "large" : "small", openedByClick: openedByClick })
		})
	}
	render() {
		let headerClasses = "fsbl-header fsbl-tabs-enabled";
		console.log("render")
		//If we're showing tabs, we throw these classes on to modify styles.
		if (this.state.showTabs) {
			headerClasses += " fsbl-tabs-enabled";
		}
		if (this.state.tabs.length > 1) {
			headerClasses += " fsbl-tabs-multiple";
		}
		var self = this;
		if (this.state.size === "small") {
			return <div onClickCapture={(e) => { self.onActionClick(e, true) }} onDragOver={this.onDragOver} draggable="true" onDragEnd={this.onDragEnd} onDragStart={this.onDragStart} className="headerContainer" >
				<div className="actionButton">{storeExports.Actions.getWindowIdentifier().windowName}</div>
			</div >
		}
		return <div className={headerClasses} onDragLeave={function (e) {
			if (!dragFromActionBar) return;
			let targetElement = e.currentTarget;
			var screenX = e.screenX;
			var screenY = e.screenY;
			setTimeout(() => {
				let boundingRect = targetElement.getBoundingClientRect();
				if (!FSBL.Clients.WindowClient.isPointInBox({ x: screenX, y: screenY }, boundingRect)) {
					self.onActionClick()
				}
			}, 200);
		}} >
			<div id="actionbutton" onClickCapture={function (e) { self.onActionClick(e, false) }} className="actionButton"></div>
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