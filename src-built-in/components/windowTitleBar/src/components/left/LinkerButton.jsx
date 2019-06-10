
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
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
                <svg width="15px" height="15px" viewBox="1 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <title>Linker</title>
                    <defs>
                        <path d="M17.9246212,15.4246212 L16.9246212,15.4246212 L16.9246212,12.9246212 C16.9246212,11.5439093 15.8053331,10.4246212 14.4246212,10.4246212 C13.0439093,10.4246212 11.9246212,11.5439093 11.9246212,12.9246212 L11.9246212,15.4246212 L10.9246212,15.4246212 L10.9246212,12.9246212 C10.9246212,10.9916246 12.4916246,9.4246212 14.4246212,9.4246212 C16.3576178,9.4246212 17.9246212,10.9916246 17.9246212,12.9246212 L17.9246212,15.4246212 Z M17.9246212,17.4246212 L17.9246212,19.9246212 C17.9246212,21.8576178 16.3576178,23.4246212 14.4246212,23.4246212 C12.4916246,23.4246212 10.9246212,21.8576178 10.9246212,19.9246212 L10.9246212,17.4246212 L11.9246212,17.4246212 L11.9246212,19.9246212 C11.9246212,21.3053331 13.0439093,22.4246212 14.4246212,22.4246212 C15.8053331,22.4246212 16.9246212,21.3053331 16.9246212,19.9246212 L16.9246212,17.4246212 L17.9246212,17.4246212 Z M14.4246212,13.4246212 C14.7007636,13.4246212 14.9246212,13.6484788 14.9246212,13.9246212 L14.9246212,18.9246212 C14.9246212,19.2007636 14.7007636,19.4246212 14.4246212,19.4246212 C14.1484788,19.4246212 13.9246212,19.2007636 13.9246212,18.9246212 L13.9246212,13.9246212 C13.9246212,13.6484788 14.1484788,13.4246212 14.4246212,13.4246212 Z" id="path-1"></path>
                        <filter x="-28.6%" y="-7.1%" width="157.1%" height="128.6%" filterUnits="objectBoundingBox" id="filter-2">
                            <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                            <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                        </filter>
                    </defs>
                    <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="atoms/icons/link" transform="translate(-6.000000, -9.000000)" fillRule="nonzero">
                            <g id="Linker" transform="translate(14.424621, 16.424621) rotate(45.000000) translate(-14.424621, -16.424621) ">
                                <use fill="black" fillOpacity="1" filter="url(#filter-2)" xlinkHref="#path-1"></use>
                                <use fill="#FFFFFF" xlinkHref="#path-1"></use>
                            </g>
                        </g>
                    </g>
                </svg>
                <FinsembleHoverDetector edge="top left" hoverAction={this.hoverAction} />
            </div >
            <LinkerGroups />
        </div >);
    }
}
