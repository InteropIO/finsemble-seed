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
		this.domNeedsUpdating = false;
	}
	bindCorrectContext() {
		this.onComponentListUpdate = this.onComponentListUpdate.bind(this);
		this.onPinsUpdate = this.onPinsUpdate.bind(this);
		this.updateDom = this.updateDom.bind(this);
		this.buildComponentItem = this.buildComponentItem.bind(this);
	}

	onComponentListUpdate(err, data) {
		FSBL.Clients.Logger.debug("appLauncher onComponentListUpdate");
		this.domNeedsUpdating = true; // when list changes then will need up update DOM
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
		if (this.domNeedsUpdating) {
			FSBL.Clients.Logger.debug("appLauncher componentDidUpdate updateDom");
			this.updateDom();
			this.domNeedsUpdating = false;
		}
	}

	updateDom() {
		FSBL.Clients.WindowClient.fitToDOM(
			{
				maxHeight: 500
			}, function () { });
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
	launchComponent(component, params, cb) {
		if (component.dontHideSelf) {
			delete component.dontHideSelf;
		} else {
			finsembleWindow.hide();
		}
		// If we are launching a group
		if (component.group) {
			for (let i of Object.keys(component.list)) {
				let cloneParams = Object.assign({}, params);
				let c = component.list[i];
				if (c.component.windowGroup) {
					cloneParams.groupName = c.component.windowGroup;
				}
				appLauncherActions.launchComponent(component.list[i], params, cb);
			}
		} else {
			if (component.component.windowGroup) {
				params.groupName = component.component.windowGroup
			}
			appLauncherActions.launchComponent(component, params, cb);
		}


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
		if ((!config.window ||
			!config.foreign.components["App Launcher"] ||
			!config.foreign.components["App Launcher"].launchableByUser) &&
			!config.group) {
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
		FSBL.Clients.Logger.debug("this.state", this.state);
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