/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";
import { getStore, Actions as HeaderActions } from "../../stores/windowTitleBarStore";
import { getChannelLabelFromIndex } from "../../../../shared/linkerUtil";
let windowTitleBarStore;
let accessibleLinker;
export default class LinkerGroups extends React.Component {
    constructor(props) {
        super(props);
        /**
		 * We assign in the constructor instead of via a require at the top of the file because the store is initialized asynchronously.
		 */
        windowTitleBarStore = getStore();
        this.bindCorrectContext();
        this.state = {
            channels: FSBL.Clients.LinkerClient.getState().channels,
            accessibleLinker: false
        };
    }
    /**
     * This is necessary to make sure that the `this` inside of the callback is correct.
     *
     * @memberof LinkerGroups
     */
    bindCorrectContext() {
        this.onChannelChange = this.onChannelChange.bind(this);
    }

    /**
     * Add listeners to the store.
     *
     * @memberof LinkerGroups
     */
    componentWillMount() {
        //are we using the accessible linker?
        FSBL.Clients.ConfigClient.getValue("finsemble.accessibleLinker", (err, value) => {
            if (err) {
                console.err("Error getting accessibleLinker value", err);
            }

            // Default value for accessibleLinker is true.
            this.setState({
                accessibleLinker: value && typeof value === "boolean" ? value : true
            });
        });
        windowTitleBarStore.addListener({ field: "Linker.channels" }, this.onChannelChange);
    }

    /**
     * Remove listeners from the store.
     *
     * @memberof LinkerGroups
     */
    componentWillUnmount() {
        windowTitleBarStore.removeListener({ field: "Linker.channels" }, this.onChannelChange);
    }

    /**
     * When the user adds/removes a link in the linkerWindow, the values in the store will change, and this listener will be invoked.
     *
     * @param {any} err
     * @param {any} response
     * @memberof LinkerGroups
     */
    onChannelChange(err, response) {
        this.setState({ channels: response.value });
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

    onClick(e, channel) {
        FSBL.Clients.LinkerClient.bringAllToFront({
            channel: channel,
            restoreWindows: true
        });
    }

    /**
     * Render method.
     *
     * @returns
     * @memberof LinkerGroups
     */
    render() {
        let self = this;
        const { accessibleLinker } = this.state;
		const getLabel = (channel) => {
			if (!accessibleLinker) {
                return null;
            } else if (channel.label) {
				return channel.label;
			} else {
                //backwards compatibility
				return getChannelLabelFromIndex(channel.name, FSBL.Clients.LinkerClient.getAllChannels());
			}
		}

        if (!this.state.channels) {
            return (<div className="linker-groups"></div>);
        }

        /**
         * Iterate through the channels that the window belongs to, render a colored bar to denote channel membership.
         */
        let channels = self.state.channels.map(function (channel, index) {
            let classNames = `linker-group${accessibleLinker ? ` linker-group-accessible linker-${channel.label}` : ""}`;
            return (<div key={channel.name} className={classNames} title={"Channel " + getChannelLabelFromIndex(channel.name, FSBL.Clients.LinkerClient.getAllChannels())} style={{ background: channel.color }} onMouseUp={function (e) { self.onClick(e, channel.name) }}>
                {getLabel(channel)}
            </div>);
        });
        return (<div className="linker-groups">
            {channels}
        </div>);
    }
}