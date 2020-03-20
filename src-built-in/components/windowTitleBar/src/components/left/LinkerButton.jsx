
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import LinkerGroups from "./LinkerGroups";
import { getStore, Actions as HeaderActions } from "../../../../../../../finsemble-ui/src/components/windowTitlebar/stores/windowTitleBarStore";
import { ReactComponent as LinkerButtonIcon } from '../../../../../../assets/img/titlebar/linker.svg'
import { StoreConditional } from "../../StoreConditional";
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
            channels: {},
            allChannels: {},
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
        this.onChannelsChange = this.onChannelsChange.bind(this);
        this.onAllChannelsChange = this.onAllChannelsChange.bind(this);
        this.onShowLinkerButton = this.onShowLinkerButton.bind(this);
        this.hoverAction = this.hoverAction.bind(this);
        this.showLinkerWindow = this.showLinkerWindow.bind(this);
    }
    /**
     * When the user selects/deselects a channel in the linkerWindow, this event listener is invoked.
     *
     * @param {any} err
     * @param {any} response
     * @memberof LinkerButton
     */
    onChannelsChange(err, response) {
        this.setState({ channels: response.value });
    }
    /**
     * This listener is invoked when a new channel is registered with linkerService.
     *
     * @param {any} err
     * @param {any} response
     * @memberof LinkerButton
     */
    onAllChannelsChange(err, response) {
        this.setState({ allChannels: response.value });
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
        e.persist(); // So that React allows us to access the target
        e.preventDefault();
        e.stopPropagation();
        let payload = {
            channels: FSBL.Clients.LinkerClient.getState().channels,
            windowIdentifier: FSBL.Clients.WindowClient.getWindowIdentifier()
        };
        let self = this;
        FSBL.Clients.RouterClient.query("Finsemble.LinkerWindow.SetActiveChannels", payload, function () {
            let wi = {
                componentType: "linkerWindow"
            };
            //The offset parent is needed so that the menu isn't shown relative to the icon.
            // The HTMLElement.offsetParent read-only property returns a reference to the object which is the closest (nearest in the containment hierarchy) positioned containing element.
            let linkerParent = self.refs.LinkerButton.offsetParent ? self.refs.LinkerButton.offsetParent : self.refs.LinkerButton.parentElement;

            let params = {
                position: 'relative',
                left: linkerParent.offsetLeft,
                top: linkerParent.offsetHeight,
                forceOntoMonitor: true,
                spawnIfNotFound: false
            };
            //pass linkerbutton. If it's clicked while the menu is open, we let the blur occur.
            FSBL.Clients.LauncherClient.toggleWindowOnClick(self.refs.LinkerButton, wi, params);
        });
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

        ////console.log("windowTitleBarStore--", windowTitleBarStore)
        windowTitleBarStore.addListener({ field: "Linker.channels" }, this.onChannelsChange);
        windowTitleBarStore.addListener({ field: "Linker.allChannels" }, this.onAllChannelsChange);
        windowTitleBarStore.addListener({ field: "Linker.showLinkerButton" }, this.onShowLinkerButton);
    }

    /**
     * Remove listeners from the store.
     *
     * @memberof LinkerButton
     */
    componentWillUnmount() {
        windowTitleBarStore.removeListener({ field: "Linker.channels" }, this.onChannelsChange);
        windowTitleBarStore.removeListener({ field: "Linker.allChannels" }, this.onAllChannelsChange);
        windowTitleBarStore.removeListener({ field: "Linker.showLinkerButton" }, this.onShowLinkerButton);
    }
    /**
     * Render method.
     *
     * @returns
     * @memberof LinkerButton
     */
    render() {
        return (<div ref="LinkerButton" title="Link Data" className="linkerSection">
            <div className="fsbl-icon fsbl-linker" data-hover={this.state.hoverState} onClick={this.showLinkerWindow} >
                <LinkerButtonIcon />
                <FinsembleHoverDetector edge="top left" hoverAction={this.hoverAction} />
            </div >
            <LinkerGroups />
        </div >);
    }
}

export const Linker = LinkerButton;