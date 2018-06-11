




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
			showTabs: false,
			tabBarBoundingBox: {},
			tabs: [],
			windowTitle: "This window",
			loaded: false
		};
	}

	componentWillMount() {
		var self = this;

		storeExports.initialize(HeaderStore.getCompanionWindow(), function () {

			FSBL.Clients.ConfigClient.getValue({ field: "finsemble" }, (err, config) => {
				let windowManager = config['Window Manager'];
				self.setState({
					loaded: true,
					windowTitle: HeaderStore.getCompanionWindow().windowName,
					showTabs: typeof config['Window Manager'] !== undefined ? config['Window Manager'].showTabs : false
				});
			})
		})

	}
	componentWillunMount() {

	}

	render() {
		var self = this;
		let tabRegionClasses = "fsbl-tab-area";
		if (!this.state.loaded) return null;
		return <div className="fsbl-header-center">

			{this.state.showTabs &&
				<TabRegion
					onTabDropped={() => { }}
					className={tabRegionClasses}
					thisWindowsTitle={this.state.windowTitle}
					boundingBox={this.state.tabBarBoundingBox}
					listenForDragOver={true}
					tabs={this.state.tabs}
					ref="tabArea"
				/>}</div>

	}
}