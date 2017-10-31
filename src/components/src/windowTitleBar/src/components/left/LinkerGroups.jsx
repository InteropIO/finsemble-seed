/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import HoverDetector from "../HoverDetector.jsx";
import { getStore, Actions as HeaderActions } from "../../stores/windowTitleBarStore";
let windowTitleBarStore;

export default class LinkerGroups extends React.Component {
	constructor(props) {
		super(props);
        /**
		 * We assign in the constructor instead of via a require at the top of the file because the store is initialized asynchronously.
		 */
		windowTitleBarStore = getStore();
		this.bindCorrectContext();
		this.state = {
			groups: FSBL.Clients.LinkerClient.getGroups().groups
		};
	}
    /**
     * This is necessary to make sure that the `this` inside of the callback is correct.
     *
     * @memberof LinkerGroups
     */
	bindCorrectContext() {
		this.onGroupChange = this.onGroupChange.bind(this);
	}

    /**
     * Add listeners to the store.
     *
     * @memberof LinkerGroups
     */
	componentWillMount() {
		windowTitleBarStore.addListener({ field: "Linker.groups" }, this.onGroupChange);
	}

    /**
     * Remove listeners from the store.
     *
     * @memberof LinkerGroups
     */
	componentWillUnmount() {
		windowTitleBarStore.removeListener({ field: "Linker.groups" }, this.onGroupChange);
	}

    /**
     * When the user adds/removes a link in the linkerWindow, the values in the store will change, and this listener will be invoked.
     *
     * @param {any} err
     * @param {any} response
     * @memberof LinkerGroups
     */
	onGroupChange(err, response) {
		this.setState({ groups: response.value });
	}

    /**
     * Whenever the store changes, set state.
     *
     * @param {any} newState
     * @memberof LinkerGroups
     */
	onStoreChanged(newState) {
		this.setState(newState);
	}

    /**
     * Render method.
     *
     * @returns
     * @memberof LinkerGroups
     */
	render() {
		let self = this;
		if (!this.state.groups) {
			return (<div className="linker-groups"></div>);
		}

        /**
         * Iterate through the groups that the window belongs to, render a colored bar to denote group membership.
         */
		let groups = self.state.groups.map(function (group, index) {
			let classNames = `linker-group linker-${group.label}`;
			return (<div key={group.name} className={classNames} style={{ background: group.color }}></div>);
		});
		return (<div className="linker-groups">
            {groups}
        </div>);
	}
}