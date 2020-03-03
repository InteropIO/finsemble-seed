/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
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
		const { pinnedComponents } = this.state;
		const { key, isUserDefined } = params;
		const config = this.state.componentList[key];
		let displayName = key;
		let isPinned = false;

		if ((!config.window ||
			!config.foreign ||
			!config.foreign.components ||
			!config.foreign.components["App Launcher"] ||
			!config.foreign.components["App Launcher"].launchableByUser) &&
			!config.group) {
			return;
		}

		for (let i = 0; i < pinnedComponents.length; i++) {
			if (pinnedComponents[i].component === key) {
				isPinned = true;
				break;
			}
		}

		// Component developers can define a display name that will show instead of the component's type.
		if (config.component && config.component.displayName) {
			displayName = config.component.displayName;
		}

		return (<ComponentItem
			isPinned={isPinned}
			key={key}
			name={displayName}
			component={config}
			itemAction={this.launchComponent}
			togglePin={this.togglePin}
			isUserDefined={isUserDefined} />);
	}

	renderComponentsList() {
		const { state } = this;
		const components = Object.keys(state.componentList);
		// if this is greater than 0, we don't show a note telling the user to check their configs.
		// iterate through componentList and render a componentItem for each one.
		const componentList = components.map((key, i) => {
			const { component } = state.componentList[key];
			const isUserDefined = Boolean(component && component.isUserDefined);
			return this.buildComponentItem({ i, key, isUserDefined });
		});
		return (<FinsembleMenuSection
			maxHeight={350} scrollable={true}
			className="ComponentList menu-primary">
			{
				componentList.length ? componentList :
					<p> No components loaded.
						Make sure to check ./src/components.json
						to make sure you've set everything up correctly.</p>
			}
		</FinsembleMenuSection>);
	}

	render() {
		return (
			this.state.componentList
				? this.renderComponentsList()
				: <div></div>
		);
	}
}
