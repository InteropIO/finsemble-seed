/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

import { FinsembleProvider, FinsembleCSS, FEAGlobals, useTitle, StoreModel, ListenerFunction, DisplayMetadata, StandardError } from "@finsemble/finsemble-core";
import { getRouterTopicName, log, debug, errorLog } from "../customFDC3/utils";
import { STATE_DISTRIBUTED_STORE_STATE_FIELD, STATE_DISTRIBUTED_STORE_NAME, STATE_DISTRIBUTED_STORE_ALLCHANNELS_FIELD, STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD, STATE_DISTRIBUTED_STORE_ACTIVEWINDOWNAME_FIELD } from "../customFDC3/constants";
import { Direction } from "../customFDC3/types";
import "@finsemble/finsemble-core/dist/lib/ui/assets/css/linkerWindow.css";
import "./customFDC3Linker.css"

/**
 * Helper function to focus a remote window.
 * @param windowName The window to focus
 */
const focusWindow = async (windowName?: string) => {
	if (windowName === undefined) {
		return;
	}

	const { wrap } = await FEAGlobals.FSBL.FinsembleWindow.getInstance({ windowName });
	wrap?.focus();
};

/**
 * Darkens a color slightly to enable its use as a border color.
 * @param col Colour hex string
 * @returns Colour hex strig (will be preceded by #)
 */
export function darkenColor(col): string {
	if ( col[0] == "#" ) {
		col = col.slice(1);
	}
	//amount to darken color
	const amt = 10;
	var num = parseInt(col, 16);
	var r = (num >> 16) + amt;
	r = r>0 ? r : 0;
	var b = ((num >> 8) & 0x00FF) + amt;
	b = b>0 ? b : 0;
	var g = (num & 0x0000FF) + amt;
	g = g>0 ? g : 0;
	var newColor = g | (b << 8) | (r << 16);
	return "#" + newColor.toString(16);
}


/**
 * API call to link an app to a specified channel, with a specified direction. 	
 * 
 * The default direction is "Both"
 * If more than one instance of the same application is launched, displays a prompt asking the user 
 * if they would like to link all instances of the application to the target channel.
 * 
 * @param channelName The channel name to link to.
 * @param direction The direction to link in, valid values include "Both", "Listen", "Broadcast" and control whether messages are sent or received by `publishToChannel` and `addChannelListener`.
 * @param windowName The windowName to apply the change to.
 * @param doNotApplyAgain If false, prompt the user to add other apps of teh same type to the channel
 */
function linkToChannel (channelName: string, direction: Direction, windowName: string, doNotApplyAgain: boolean): void {
	//check args
	if (!Object.values<string>(Direction).includes(direction)) {
		const errMsg = `Unrecognized direction '${direction}', valid directions: ${Object.values(Direction)}`;
		errorLog(errMsg);	
	} else {
		log(`linkToChannel setting channel state for remote window '${windowName}', channel '${channelName}', direction '${direction}', doNotApplyAgain '${doNotApplyAgain}'`);
			
		//Use a router transmit to tell the named window to make this call then return
		FSBL.Clients.RouterClient.transmit(
			getRouterTopicName("linkToChannel",windowName),
			{channelName, direction, doNotApplyAgain}
		);
	}
};

/**
 * API call to unlink an app from a specified channel. 
 * @param channelName The channel name to unlink from.
 * @param windowName The windowName to apply the change to, will target local window if falsey.
 * @param doNotApplyAgain If false, prompt the user to add other apps of teh same type to the channel
 */
function unlinkFromChannel (channelName: string, windowName: string, doNotApplyAgain: boolean): void {
	//Use a router transmit to tell the named window to make this call then return
	FSBL.Clients.RouterClient.transmit(
		getRouterTopicName("unlinkFromChannel",windowName),
		{channelName, doNotApplyAgain}
	);
};

const CustomLinkerElement: React.FunctionComponent<{ title?: string }> = ({
	title,
}) => {
	// Track which menu item has focus for keyboard users
	const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);
	// Track which channel is highlighted for direciton menu
	const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

	//Ref for container element
	const containerElement = useRef<HTMLDivElement>(null);
	//set up channel state here, with connection to distrib store
	const [activeWindowName, setActiveWindowName] = useState<string | null>(null);
	const [windowChannelDirections, setWindowChannelDirections] = useState<
		Record<string, Record<string, Direction>>
	>({});
	const [allChannels, setAllChannels] = useState<
		Record<string, DisplayMetadata>
	>({}); //to be populated when a component using the preload is spawned

	//Create the Distributed store used to share state with the preload
	//However, note that the channels must be populated by the first component to come up
	//(as we don't have access to FDC3 in a UI component)
	let distribStoreObj: StoreModel | null = null;
	const channelStateHandler: ListenerFunction<
		Record<string, Record<string, Direction>>
	> = (err, response) => {
		debug("Received channel directions update: ", response.value);
		setWindowChannelDirections(response.value);
	};
	const allChannelsHandler = (
		err: StandardError,
		values: Record<string, DisplayMetadata>
	) => {
		//listeners and get retrun values in slightly different places
		log("Received all channels:", values);
		setAllChannels(values);
	};
	const activeWindowHandler: ListenerFunction<string | null> = (
		err,
		response
	) => {
		log("Received new active window:", response.value);
		setActiveWindowName(response.value);
	};
	const getDistributedStore = async () => {
		const setHandlers = (storeObj: StoreModel) => {
			distribStoreObj = storeObj;
			distribStoreObj.addListener(
				[STATE_DISTRIBUTED_STORE_STATE_FIELD],
				channelStateHandler
			);
			distribStoreObj.addListener(
				[STATE_DISTRIBUTED_STORE_ACTIVEWINDOWNAME_FIELD],
				activeWindowHandler
			);

			//just retrieve the channels, we need the initial state and it should not change
			distribStoreObj.get(
				[STATE_DISTRIBUTED_STORE_ALLCHANNELS_FIELD],
				allChannelsHandler
			);

			debug(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} connected`);
		};
		FSBL.Clients.DistributedStoreClient.getStore(
			{
				store: STATE_DISTRIBUTED_STORE_NAME,
				global: true,
			},
			(err2, storeObject2) => {
				if (err2 || !storeObject2) {
					errorLog(
						`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} could not be retrieved`,
						err2
					);
				} else {
					setHandlers(storeObject2);
				}
			}
		);
	};
	const unsubscribeDistributedStore = () => {
		distribStoreObj?.removeListener(
			[STATE_DISTRIBUTED_STORE_STATE_FIELD],
			channelStateHandler
		);
		distribStoreObj?.removeListener(
			[STATE_DISTRIBUTED_STORE_ACTIVEWINDOWNAME_FIELD],
			activeWindowHandler
		);
	};

	useEffect(() => {
		getDistributedStore();

		return () => {
			unsubscribeDistributedStore();
		};
	}, []);

	const hideWindow = () => {
		// Must blur or you end up having to click twice to show the window.
		// If you just hide, the first time the user clicks
		// on the linker button, the blur will trigger, which will hide the window.
		FEAGlobals.finsembleWindow.blur();
		FEAGlobals.finsembleWindow.hide();
		// Reset internal focus to the first item in the linker for the next time the window is opened
		moveFocus(0);

		// Send focus back to the calling window when the linker is hidden
		if (activeWindowName) {
			focusWindow(activeWindowName);
			//reset to null in distributed store?
		}
	};

	useTitle(title ?? "CustomFDC3Linker");

	useEffect(() => {
		// Move focus to container element, so that keystrokes can be captured for keyboard users (accessibility)
		containerElement.current && containerElement.current.focus();

		// Without these events, the linker menu is opened but doesn't focus, so the blur event never fires, and the menu is left
		// orphaned and sad.

		const focusWindow = () => {
			FEAGlobals.finsembleWindow.focus();
		};

		FEAGlobals.FSBL.Clients.Logger.system.log(
			"CustomFDC3Linker component is mounted. Initializing."
		);
		FEAGlobals.finsembleWindow.addEventListener("blurred", hideWindow);
		FEAGlobals.finsembleWindow.addEventListener("shown", focusWindow);

		return () => {
			FEAGlobals.FSBL.Clients.Logger.system.log(
				"CustomFDC3Linker component is unmounted. Cleaning up the event listeners."
			);
			FEAGlobals.finsembleWindow.removeEventListener("blurred", hideWindow);
			FEAGlobals.finsembleWindow.removeEventListener("shown", focusWindow);
		};
	}, []);

	const toggleChannel = (channelId: string | null, direction?: Direction) => {
		if (channelId && activeWindowName && windowChannelDirections) {
			//handle cases where there is no state yet - although the preload should create this as soon as it comes up
			if (!windowChannelDirections[activeWindowName]) {
				windowChannelDirections[activeWindowName] = {};
			}

			//handle cases with Direction
			if (direction) {
				if (
					windowChannelDirections[activeWindowName][channelId] &&
					windowChannelDirections[activeWindowName][channelId] == direction
				) {
					unlinkFromChannel(channelId, activeWindowName, false);
				} else {
					linkToChannel(channelId, direction, activeWindowName, false);
				}
			} else {
				//handle cases with no direction
				if (windowChannelDirections[activeWindowName][channelId]) {
					unlinkFromChannel(channelId, activeWindowName, false);
				} else {
					linkToChannel(channelId, Direction.Both, activeWindowName, false);
				}
			}
		} else {
			errorLog(
				"Essential state not found! activeWindow:",
				activeWindowName,
				"windowChannelDirections: ",
				windowChannelDirections,
				"channelId",
				channelId
			);
		}

		hideWindow();
	};

	const channelElements =
		activeWindowName &&
		Object.keys(allChannels).map((channelId, index) => {
			const stateForWindow: Record<string, Direction> | null =
				windowChannelDirections[activeWindowName];
			const active: boolean = stateForWindow && !!stateForWindow[channelId];
			const style = {
				backgroundColor: allChannels[channelId].color,
				border: "1px solid " + darkenColor(allChannels[channelId].color), // we've only got the core colour, border has to be calculated
			};
			return (
				<div
					key={channelId}
					className={`channel-wrapper`} // Note Finsemble uses CSS classes here so borders can differ/provide shadow
					onClick={() => toggleChannel(channelId)}
					onMouseEnter={(e) => {onMouseEnterChannel(channelId, e)}}
					tabIndex={index}
					role="menuitemcheckbox"
					aria-checked={!!active}
				>
					<div className="channel-label">
						{allChannels[channelId].name ?? channelId}
					</div>
					<div className="linker-glyph" style={style}>
						{active ? (
							<i
								className="active-linker-group ff-check-mark"
								aria-hidden="true"
							></i>
						) : null}
					</div>
				</div>
			);
		});

	/**
	 * Helper function to render a direction arrow
	 * @param hexColor Arrow colour
	 * @param direction Arrow direction
	 * @returns Styled spawn element
	 */
	const directionElement = (direction: Direction, tabIndex: number) => {
		const hexColor = activeChannelId ? allChannels[activeChannelId]?.color : null ?? "#000000";
		let style = {
			textShadow: `1px 0px 0px ${hexColor}`,//.replace('#A21EBC', '#c760dc'), //optimization group1 color bad visual effects under dark theme
			color: hexColor//.replace("#A21EBC", "#c760dc"),//same as above
		}
		let theChar = "↕";
		switch (direction) {
			case "Broadcast":
				theChar = "↑"; break;
			case "Listen":
				theChar = "↓"; break;
		}
		const active: boolean = !!activeWindowName && !!activeChannelId && windowChannelDirections?.[activeWindowName]?.[activeChannelId] == direction;
		return <div className="directionWrapper"
				onClick={() => toggleChannel(activeChannelId, direction)}
				tabIndex={tabIndex}
				role="menuitemcheckbox"
				aria-checked={active}
			>
				<div
					key={`${direction}`}
					tabIndex={-1}
					className={`directionIcon${active ? " activeDirection": ""}`}
					title={`${activeChannelId} ${direction}`}
					style={style}
				>
					{theChar} {direction}
				</div>
			</div>
	};

	const moveFocus = (newIndex: number) => {
		setFocusedMenuIndex(newIndex);
		const elements = containerElement.current?.querySelectorAll(
			"[role='menuitemcheckbox']"
		) as NodeListOf<HTMLDivElement>;
		elements?.[newIndex].focus();
		log("move, newIndex", newIndex);
		if (newIndex < Object.keys(allChannels).length) {
			const newChannel = Object.keys(allChannels)[newIndex];
			onMouseEnterChannel(newChannel, null);
		} 
	};

	/** Keyboard navigation needs adjustement - it should support moving left/right 
	 *  and should set the active
	*/
	const manageKeyboardNavigation = (
		evt: React.KeyboardEvent<HTMLDivElement>
	) => {
		const lastChannelIndex = Object.keys(allChannels).length - 1;
		const lastDirectionIndex = lastChannelIndex + 3;

		let focusDirections = focusedMenuIndex > lastChannelIndex;

		if (evt.key === "Tab" || evt.key === "ArrowDown") {
			evt.preventDefault();
			if (focusDirections) {
				moveFocus(
					focusedMenuIndex >= lastDirectionIndex ? lastChannelIndex+1 : focusedMenuIndex + 1
				);
			} else {
				moveFocus(
					focusedMenuIndex >= lastChannelIndex ? 0 : focusedMenuIndex + 1
				);
			}
		} else if (evt.key === "ArrowUp") {
			if (focusDirections) {
				moveFocus(
					focusedMenuIndex <= lastChannelIndex+1 ? lastDirectionIndex : focusedMenuIndex - 1
				);
			} else {
				moveFocus(
					focusedMenuIndex <= 0 ? lastChannelIndex : focusedMenuIndex - 1
				);
			}
			
		} else if (evt.key === "ArrowRight") {
			if (!focusDirections) {
				moveFocus(
					lastChannelIndex + 1 //highlight first direction
				);
			}
		} else if (evt.key === "ArrowLeft") {
			if (focusDirections) {
				moveFocus(
					0 //highlight first channel
				);
			}
		} else if (evt.key === "Enter") {
			if (focusedMenuIndex <= lastChannelIndex) {
				toggleChannel(Object.keys(allChannels)[focusedMenuIndex]);
			} else {
				switch (focusedMenuIndex-lastChannelIndex) {
					case 1:
						toggleChannel(activeChannelId, Direction.Both);
						break;
					case 2:
						toggleChannel(activeChannelId, Direction.Listen);
						break;
					case 3:
						toggleChannel(activeChannelId, Direction.Broadcast);
						break;
					default:
						errorLog("Unknown focusedMenuIndex ", focusedMenuIndex, "lastChannelIndex", lastChannelIndex, "lastDirecitonIndex", lastDirectionIndex);
				}
			}
		} else if (evt.key === "Escape") {
			hideWindow();
		}
	};

	const onMouseLeaveChannels = async () => {
		setActiveChannelId(null);
		let {err, data: bounds} = await finsembleWindow.getBounds();
		if (bounds && bounds.width != 133) {
			bounds.width = 133
			await finsembleWindow.setBounds({ bounds });
		}
	}
	const onMouseEnterChannel = async (channelId, e) => {
		log("spoon");
		let {err, data: bounds} = await finsembleWindow.getBounds();
		if (bounds && bounds.width != 290) {
			bounds.width = 290
			await finsembleWindow.setBounds({ bounds });
		}
		setActiveChannelId(channelId);
	}

	return (
		<div
			className="menuContainer"
			tabIndex={-1}
			role="menu"
			ref={containerElement}
			onKeyDown={manageKeyboardNavigation}
			onMouseLeave={onMouseLeaveChannels}
		>
			<div className="linkerContainer">{channelElements}</div>
			<div
				className="directionContainer"
			>	
				<div className="directionTitle">Channel Direction</div>
				{directionElement(Direction.Both, Object.keys(allChannels).length+1)}
				{directionElement(Direction.Listen, Object.keys(allChannels).length+2)}
				{directionElement(Direction.Broadcast, Object.keys(allChannels).length+3)}
			</div>
		</div>
	);
};


ReactDOM.render(
	<FinsembleProvider>
		<FinsembleCSS />
		<CustomLinkerElement />
	</FinsembleProvider>,
	document.getElementsByTagName("div")[0]
);

