/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React, { useEffect } from "react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import ReactDOM from "react-dom";
import "./css/linkerWindow.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import * as storeExports from "./stores/linkerStore";
import { getChannelLabelFromIndex } from "../../shared/linkerUtil";

import store from '../../UIAPI/store';
import * as linkerActions from "../../UIAPI/actions/linkerActions";

let LinkerStore = storeExports.Store;

const LinkerRefactored = () => {
	const linker = useSelector(state => state.linker);
	const dispatch = useDispatch();
	
	const toggleChannel = (linkerIndex) => {
		dispatch(linkerActions.toggleChannel(linkerIndex));
	};

    useEffect(() => {
		dispatch(linkerActions.init());
        return () => {
            dispatch(linkerActions.cleanUp());
        }
	}, []);

	const allChannels = Object.values(linker.channels);
    const channelsElements = allChannels.map(({color, name, active, id}) => {
        const groupClass = `linkerGroup ${color}`;
        const style = {
            backgroundColor: color,
            border: `1px solid ${color}`
		}
        return (
            <div key={id} className="channel-wrapper" onClick={() => toggleChannel(id)}>
                <div className="channel-label">{name}</div>
				<div className={groupClass} style={style}>
					{active ? <i className="active-linker-group ff-check-mark"></i> : null}
				</div>
            </div>
        );
    });

    return (
        <div className="linkerContainer">
            {channelsElements}
        </div>
    );
}


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
	// onStoreChanged(changeEvent) {
	// 	switch (changeEvent) {
	// 		case "state":
	// 			this.setState({
	// 				channels: LinkerStore.getChannels(),
	// 				attachedWindowIdentifier: LinkerStore.getAttachedWindowIdentifier()
	// 			});
	// 	}
	// }
	/**
	 * Event handler when the user clicks on a colored rectangle, indicating that they want the attached window to join the channel.
	 *
	 * @param {any} channel
	 * @param {any} active
	 * @returns
	 * @memberof Linker
	 */
	// channelClicked(channel, active) {
	// 	var attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();
	// 	FSBL.FinsembleWindow.getInstance({ name: attachedWindowIdentifier.windowName }, (err, attachedWindow) => {
	// 		if (attachedWindow) attachedWindow.focus();
	// 	});

	// 	if (!active) return LinkerActions.linkToChannel(channel.name);
	// 	LinkerActions.unlinkFromChannel(channel.name);
	// }
	/**
	 * Hides window on blur.
	 *
	 * @memberof Linker
	 */
	// onWindowBlur() {
	// 	finsembleWindow.hide();
	// }
	/**
	 * Fit the contents of the dom to the window's bounds. Also set the component's state.
	 *
	 * @memberof Linker
	 */
	componentWillMount() {
		// finsembleWindow.addEventListener("blurred", this.onWindowBlur.bind(this));
		// LinkerStore.addListener(["stateChanged"], this.onStoreChanged);
		this.setState({
			channels: LinkerStore.getChannels(),
			attachedWindowIdentifier: LinkerStore.getAttachedWindowIdentifier()
		});
	}
	// componentDidMount() {
	// 	LinkerActions.windowMounted();
	// }
	render() {
		// var self = this;
		//Checkbox inside of a circle. Rendered in the center of a group if the attachedWindow is part of that group.
		// let activeChannelIndicator = (<i className="active-linker-group ff-check-mark"></i>);

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
	ReactDOM.render(
		<Provider store={store}>
    		<LinkerRefactored />
  		</Provider>,
   		document.getElementById("main")
   	);
}
