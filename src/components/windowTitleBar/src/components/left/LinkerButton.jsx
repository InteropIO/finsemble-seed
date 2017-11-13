
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import HoverDetector from "../HoverDetector.jsx";
import LinkerGroups from "./LinkerGroups";
import { getStore, Actions as HeaderActions } from "../../stores/windowTitleBarStore";
let windowTitleBarStore;

/**
 * Linker button; located on the left side of the windowTitleBar.
 */
export default class LinkerButton extends React.Component {
    constructor(props) {
        super(props);
        this.bindCorrectContext();
        /**
         * We assign in the constructor instead of via a require at the top of the file because the store is initialized asynchronously.
         */
        windowTitleBarStore = getStore();
        this.state = {
            groups: {},
            allGroups: {},
            showLinker: false,
            hoverState: "false"
        };
    }
    /**
     * This is necessary to make sure that the `this` inside of the callback is correct.
     *
     * @memberof LinkerButton
     */
    bindCorrectContext() {
        this.onGroupsChange = this.onGroupsChange.bind(this);
        this.onAllGroupsChange = this.onAllGroupsChange.bind(this);
        this.onShowLinkerButton = this.onShowLinkerButton.bind(this);
        this.hoverAction = this.hoverAction.bind(this);
    }
    /**
     * When the user selects/deselects a group in the linkerWindow, this event listener is invoked.
     *
     * @param {any} err
     * @param {any} response
     * @memberof LinkerButton
     */
    onGroupsChange(err, response) {
        this.setState({ groups: response.value });
    }
    /**
     * This listener is invoked when a new group is registered with linkerService.
     *
     * @param {any} err
     * @param {any} response
     * @memberof LinkerButton
     */
    onAllGroupsChange(err, response) {
        this.setState({ allGroups: response.value });
    }
    /**
     * When we read the config from the window, we determine if the linker button should be shown. When that value changes, this listener is invoked.
     *
     * @param {any} err
     * @param {any} response
     * @memberof LinkerButton
     */
    onShowLinkerButton(err, response) {
        this.setState({ showLinker: response.value });
    }

    /**
     * When any data in the store changes, we invoke this listener.
     *
     * @param {any} newState
     * @memberof LinkerButton
     */
    onStoreChanged(newState) {
        this.setState(newState);
    }

    /**
     * Invoked when the linker button is clicked.
     *
     * @param {any} e
     * @memberof LinkerButton
     */
    showLinkerWindow(e) {
        e.preventDefault();
        e.stopPropagation();
        FSBL.Clients.LinkerClient.openLinkerWindow(() => { });
    }

    /**
     * When your mouse enters/leaves the hoverDetector, this function is invoked.
     *
     * @param {any} newHoverState
     * @memberof LinkerButton
     */
    hoverAction(newHoverState) {
        this.setState({ hoverState: newHoverState });
    }
    /**
     * Add listeners to the store.
     *
     * @memberof LinkerButton
     */
    componentWillMount() {

        // console.log("windowTitleBarStore--", windowTitleBarStore)
        windowTitleBarStore.addListener({ field: "Linker.groups" }, this.onGroupsChange);
        windowTitleBarStore.addListener({ field: "Linker.allGroups" }, this.onAllGroupsChange);
        windowTitleBarStore.addListener({ field: "Linker.showLinkerButton" }, this.onShowLinkerButton);
    }

    /**
     * Remove listeners from the store.
     *
     * @memberof LinkerButton
     */
    componentWillUnmount() {
        windowTitleBarStore.removeListener({ field: "Linker.groups" }, this.onGroupsChange);
        windowTitleBarStore.removeListener({ field: "Linker.allGroups" }, this.onAllGroupsChange);
        windowTitleBarStore.removeListener({ field: "Linker.showLinkerButton" }, this.onShowLinkerButton);
    }
    /**
     * Render method.
     *
     * @returns
     * @memberof LinkerButton
     */
    render() {
        return (<div title="Link Data" className="linkerSection">
            <div className="fsbl-icon fsbl-linker cq-no-drag ff-linker" data-hover={this.state.hoverState} onClick={this.showLinkerWindow} >
                <HoverDetector edge="left" hoverAction={this.hoverAction} />
            </div>
            <LinkerGroups />
        </div>);
    }
}
