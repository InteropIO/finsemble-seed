




/**
 * This is our application launcher. It is opened from a button in our sample toolbar, and it handles the launching of finsemble components.
 *
 * @class TabbingSection
 * @extends {React.Component}
 */
import React from "react";
import TabRegion from './TabRegion'
import * as storeExports from "../stores/tabbingStore";
import { Store as HeaderStore, Actions as HeaderActions } from "../stores/headerStore";

export default class TabbingSection extends React.Component {
	constructor(props) {
		super(props);
		this.finWindow = fin.desktop.Window.getCurrent();
		this.state = {
			showTabs: true,
			tabBarBoundingBox: {},
			tabs: [],
			windowTitle: HeaderStore.getCompanionWindow().windowName,
			loaded: true,
			listenForDragOver: false
		};
	}

	componentWillMount() {
		var self = this;
		this.dontListenForDragOver = this.dontListenForDragOver.bind(this);
		this.listenForDragOver = this.listenForDragOver.bind(this);

		FSBL.Clients.RouterClient.addListener("DockingService.startTilingOrTabbing", this.listenForDragOver);
		//console.log("Adding listener for stopTilingOrTabbing.");
		FSBL.Clients.RouterClient.addListener("DockingService.stopTilingOrTabbing", this.dontListenForDragOver);
		FSBL.Clients.RouterClient.addListener("DockingService.cancelTilingOrTabbing", this.dontListenForDragOver);

	}
	componentWillunMount() {
		//console.log("Removing listener from the router.");
		FSBL.Clients.RouterClient.removeListener("DockingService.startTilingOrTabbing", this.listenForDragOver);
		FSBL.Clients.RouterClient.removeListener("DockingService.stopTilingOrTabbing", this.dontListenForDragOver);
	}

	/**
	 * When we are not tiling/tabbing, we want to allow the user to drag the window around via any available space in the tab-region. This function allows that.
	 */
	dontListenForDragOver() {
		//console.log("In stopTilingOrTabbing")
		this.setState({
			listenForDragOver: false
		});
	}
	/**
	 * When we are tiling/tabbing, we do not want to allow any window to be dragged around and moved.
	 */
	listenForDragOver() {
		//console.log("No longer allowing drag.")
		this.setState({
			listenForDragOver: true
		});
	}

	render() {
		var self = this;
		let tabRegionClasses = "fsbl-tab-area";
		if (!this.state.loaded) return null;
		return <div className="fsbl-header-center">
			<TabRegion
				onTabDropped={this.props.onTabDropped || Function.prototype}
				className={tabRegionClasses}
				thisWindowsTitle={this.state.windowTitle}
				boundingBox={this.state.tabBarBoundingBox}
				listenForDragOver={this.state.listenForDragOver}
				tabs={this.state.tabs}
				ref="tabArea"
			/></div>

	}
}