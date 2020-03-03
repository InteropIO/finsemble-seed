/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import "./css/linkerWindow.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import * as storeExports from "./stores/linkerStore";
import { getChannelLabelFromIndex } from "../../shared/linkerUtil";

let LinkerStore = storeExports.Store;
let LinkerActions = storeExports.Actions;

class Linker extends React.Component {
	constructor() {
		super();
		this.onStoreChanged = this.onStoreChanged.bind(this);
	}
	/**
	 * When the store changes, set the react component's state, forcing a re-render.
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
	 * Event handler when the user clicks on a colored rectangle, indicating channel state should be toggled
	 *
	 * @param {any} channel the linker channel
	 * @param {any} active true if channel was already active
	 * @memberof Linker
	 */
	channelClicked(channel, active) {
		var attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();


		FSBL.FinsembleWindow.getInstance({ name: attachedWindowIdentifier.windowName }, (err, attachedWindow) => {
			if (attachedWindow) attachedWindow.focus();
		});

		if (!active) {
			LinkerActions.linkToChannel(channel.name);
		} else {
			LinkerActions.unlinkFromChannel(channel.name);
		}

		// Immediately hide linker window when channel clicked.
		// Note: the focus above on the attached window will typically result in a blur event to the linker window that will also hide; howevever, that blur
		// event is not received for native windows.
		finsembleWindow.hide();

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
	 * Fit the contents of the dom to the window's bounds. Also set the component's state.
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
		let activeChannelIndicator = (<i className="active-linker-group ff-check-mark"></i>);

		const getLinkerItemRenderer = (channel, isAccessibleLinker) => {
			if (!isAccessibleLinker) return null;

			if (channel.label) {
				return <div className="channel-label">{channel.label}</div>
			} else {
				return <div className="channel-label">{"Channel " + getChannelLabelFromIndex(channel.name, FSBL.Clients.LinkerClient.getAllChannels())}</div>
			}
		}

		/**
		 * This function iterates through all of the channels that have registered with the linkerClient. If the attachedWindow belongs to any of them, it renders a check mark and a circle in the center of the channel's rectangle.
		 **/
		let channels = FSBL.Clients.LinkerClient.getAllChannels().map(function (channel, index) {
			//Boolean, whether the attachedWindow belongs to the channel.
			let activeChannel = self.state.channels.filter(function (g) { return g.name == channel.name; }).length;
			let groupClass = `linkerGroup ${channel.name}`;

			if (activeChannel) {
				groupClass += " active";
			}

			let style = {
				backgroundColor: channel.color,
				border: "1px solid " + channel.border
			};
			//returns a group row.
			return (
				<div className="channel-wrapper" onClick={function () {
					self.channelClicked(channel, activeChannel); {/* Circle */ }
				}}>
					{getLinkerItemRenderer(channel, LinkerStore.isAccessibleLinker())} {/*Channel Name */}
					<div key={channel.name + index} className={groupClass} style={style}>
						{activeChannel ? activeChannelIndicator : null} {/*Check Mark */}
					</div>
				</div>);
		});

		return (
			<div className="linkerContainer">
				{channels}
			</div>
		);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}
function FSBLReady() {
	LinkerStore.initialize();
	finsembleWindow.addEventListener("shown", () => {
		/** DH 6/19/2019
		 * Because Finsemble uses a combination of
		 * native OS and synthetic window events,
		 * it's possible for the Linker Window to
		 * have OS level focus but Finsemble not
		 * be aware of it. Therefore, we must trigger
		 * focus manually until we can figure out a
		 * better way of synchronizing these states.
		*/
		finsembleWindow.focus();
	});
	ReactDOM.render(<Linker />, document.getElementById("main"));
}
