/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This is the list of all components in the appLauncher.
 */
import React from "react";
import { getStore, Actions as appLauncherActions } from "../stores/appLauncherStore";
import { FinsembleMenuSection } from "@chartiq/finsemble-react-controls";
import ComponentItem from "./componentItem";

let appLauncherStore;

export default class appLauncherContainer extends React.Component {
	constructor() {
		super();

		this.state = {
			componentList: {},
			pinnedComponents: []
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.onComponentListUpdate = this.onComponentListUpdate.bind(this);
		this.onPinsUpdate = this.onPinsUpdate.bind(this);
		this.updateDom = this.updateDom.bind(this);
		this.buildComponentItem = this.buildComponentItem.bind(this);
	}

	onComponentListUpdate(err, data) {
		this.setState({
			componentList: data.value
		});
	}

	onPinsUpdate(err, data) {
		this.setState({
			pinnedComponents: data.value
		});
	}

	componentDidUpdate() {
		this.updateDom();
	}

	updateDom() {
		FSBL.Clients.WindowClient.fitToDOM(
			{
				maxHeight: 500
			}, function () {});
	}

	setInitialState() {
		let self = this;
		appLauncherStore.getValue({ field: "componentList" }, function (err, data) {
			self.setState({
				componentList: data
			});
		});
		appLauncherStore.getValue({ field: "pins" }, function (err, data) {
			self.setState({
				pinnedComponents: data
			});
		});
	}
	componentWillMount() {
		appLauncherStore = getStore();
		this.setInitialState();
		appLauncherStore.addListener({ field: "componentList" }, this.onComponentListUpdate);
		appLauncherStore.addListener({ field: "pins" }, this.onPinsUpdate);
	}
	componentWillUnmount() {
		appLauncherStore.removeListener({ field: "componentList" }, this.onComponentListUpdate);
		appLauncherStore.removeListener({ field: "pins" }, this.onPinsUpdate);
	}
	launchComponent(component, params) {
		fin.desktop.Window.getCurrent().hide();
		appLauncherActions.launchComponent(component, params);
	}
	togglePin(component) {
		appLauncherActions.togglePin(component);
	}
	buildComponentItem(params) {
		if (!this.state.componentList) {
			return;
		}
		var self = this;
		var i = params.i,
			key = params.key,
			config = self.state.componentList[key],
			isUserDefined = params.isUserDefined;
		if (!config.window ||
			!config.foreign.components["App Launcher"] ||
			!config.foreign.components["App Launcher"].launchableByUser) {
			return;
		}

		var isPinned = false;
		for (var i = 0; i < self.state.pinnedComponents.length; i++) {
			if (self.state.pinnedComponents[i].label === key) {
				isPinned = true;
				break;
			}
		}
		return (<ComponentItem
			isPinned={isPinned}
			key={key}
			name={key}
			component={config}
			itemAction={self.launchComponent}
			togglePin={self.togglePin}
			isUserDefined={isUserDefined} />);
	}
	render() {
		if (!this.state.componentList) {
			return (<div></div>);
		}
		var self = this;
		console.log("this.state", this.state);
		var buildComponentItem = this.buildComponentItem;
		var components = Object.keys(this.state.componentList);
		//if this is greater than 0, we don't show a note telling the user to check their configs.
		//iterate through componentList and render a componentItem for each one.
		var componentList = components.map(function (key, i) {
			var isUserDefined = false;
			var config = self.state.componentList[key];
			if (config.component && config.component.isUserDefined) {
				isUserDefined = true;
			}
			return buildComponentItem({
				i: i,
				key: key,
				isUserDefined: isUserDefined
			});
		});

		if (!componentList.length) {
			componentList = (<p>No components loaded. Make sure to check ./src/components.json to make sure you've set everything up correctly.</p>);
		}

		return (<FinsembleMenuSection maxHeight={350} scrollable={true} className="ComponentList menu-primary">
			{componentList}
		</FinsembleMenuSection>);
	}
}