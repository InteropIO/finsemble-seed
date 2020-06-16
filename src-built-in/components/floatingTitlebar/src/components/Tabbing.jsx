/**
 * This is our application launcher. It is opened from a button in our sample toolbar, and it handles the launching of finsemble components.
 *
 * @class TabbingSection
 * @extends {React.Component}
 */
import React from "react";
import TabRegion from "./TabRegion";
import * as storeExports from "../stores/tabbingStore";
import {
	Store as HeaderStore,
	Actions as HeaderActions,
} from "../stores/headerStore";

export default class TabbingSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showTabs: true,
			tabBarBoundingBox: {},
			tabs: [],
			windowTitle: HeaderStore.getCompanionWindow().windowName,
			loaded: true,
		};
	}
	render() {
		var self = this;
		let tabRegionClasses = "fsbl-tab-area";
		if (!this.state.loaded) return null;
		return (
			<div className="fsbl-header-center">
				<TabRegion
					onTabDropped={this.props.onTabDropped || Function.prototype}
					className={tabRegionClasses}
					thisWindowsTitle={this.state.windowTitle}
					boundingBox={this.state.tabBarBoundingBox}
					listenForDragOver={this.props.listenForDragOver}
					tabs={this.state.tabs}
					ref="tabArea"
				/>
			</div>
		);
	}
}
