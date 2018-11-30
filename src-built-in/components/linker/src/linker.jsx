/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import "./css/linkerWindow.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import * as storeExports from "./stores/linkerStore";
let LinkerStore = storeExports.Store;
let LinkerActions = storeExports.Actions;

class Linker extends React.Component {
	constructor() {
		super();
		this.onStoreChanged = this.onStoreChanged.bind(this);
	}
	/**
	 * When the store changes, set the react component's state, forcing a rerender.
	 *
	 * @param {any} changeEvent
	 * @memberof Linker
	 */
	onStoreChanged(changeEvent) {
		switch (changeEvent) {
			case "state":
				this.setState({
					channels: LinkerStore.getChannels(),
					attachedWindowIdentifier: LinkerStore.getAttachedWindowIdentifier()
				});
		}
	}
	/**
	 * Event handler when the user clicks on a colored rectangle, indicating that they want the attached window to join the channel.
	 *
	 * @param {any} channel
	 * @param {any} active
	 * @returns
	 * @memberof Linker
	 */
	channelClicked(channel, active) {
		var attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();
		var attachedWindow = fin.desktop.Window.wrap(attachedWindowIdentifier.uuid, attachedWindowIdentifier.windowName);
		attachedWindow.focus();

		if (!active) return LinkerActions.linkToChannel(channel.name);
		LinkerActions.unlinkFromChannel(channel.name);
	}
	/**
	 * Hides window on blur.
	 *
	 * @memberof Linker
	 */
	onWindowBlur() {
		finsembleWindow.hide();
	}
	/**
	 * Fit the contents of the dom to the openfin window's bounds. Also set the component's state.
	 *
	 * @memberof Linker
	 */
	componentWillMount() {
		finsembleWindow.addEventListener("blurred", this.onWindowBlur.bind(this));
		LinkerStore.addListener(["stateChanged"], this.onStoreChanged);
		this.setState({
			channels: LinkerStore.getChannels(),
			attachedWindowIdentifier: LinkerStore.getAttachedWindowIdentifier()
		});
	}
	componentDidMount() {
		LinkerActions.windowMounted();
	}
	render() {
		var self = this;
		//Checkbox inside of a circle. Rendered in the center of a group if the attachedWindow is part of that group.
		let activeChannelIndicator = (<i className="active-linker-group ff-check-circle"></i>);
		/**
		 * This function iterates through all of the channels that have registered with the linkerClient. If the attachedWindow belongs to any of them, it renders a checkmark and a circle in the center of the channel's rectangle.
		 **/
		let channels = FSBL.Clients.LinkerClient.getAllChannels().map(function (item, index) {
			//Boolean, whether the attachedWindow belongs to the channel.
			let activeChannel = self.state.channels.filter(function (g) { return g.name == item.name; }).length;
			let groupClass = `linkerGroup ${item.label}`;

			if (activeChannel) {
				groupClass += " active";
			}

			let style = {
				backgroundColor: item.color,
				border: "1px solid " + item.border
			};
			//returns a group row. It's essentially a colored rectangle.
			return (<div key={item.name + index} className={groupClass} style={style} onClick={function () {
				self.channelClicked(item, activeChannel);
			}}>
				{activeChannel ? activeChannelIndicator : null}
			</div>);
		});

		return (
			<div className="linkerContainer">
				{channels}
			</div>
		);
	}
}

fin.desktop.main(function () {
	if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
	function FSBLReady() {
		LinkerStore.initialize();
		ReactDOM.render(<Linker />, document.getElementById("main"));
	}
});