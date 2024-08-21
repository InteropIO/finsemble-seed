/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import { FEAGlobals, ListenerFunction, StandardError, StoreModel, System } from "@finsemble/finsemble-core";
import { DisplayMetadata } from "@finos/fdc3";
import React, { useEffect, useState } from "react";
import { STATE_DISTRIBUTED_STORE_ALLCHANNELS_FIELD, STATE_DISTRIBUTED_STORE_NAME, STATE_DISTRIBUTED_STORE_STATE_FIELD } from "../customFDC3/constants";
import { Direction } from "../customFDC3/types";

import { debug, errorLog, log } from "../customFDC3/utils";

/**
 * Helper function to render a direction arrow
 * @param hexColor Arrow colour
 * @param direction Arrow direction
 * @returns Styled spawn element
 */
export const directionIcon = (hexColor: string, direction: Direction, channelId: string) => {
	let style = {
		textShadow: `0px 0px 1px black`,//.replace('#A21EBC', '#c760dc'), //optimization group1 color bad visual effects under dark theme
		color: "black",//.replace("#A21EBC", "#c760dc"),//same as above
		backgroundColor: hexColor
	}
	let theChar = "↕";
	switch (direction) {
		case "Broadcast":
			theChar = "↑"; break;
		case "Listen":
			theChar = "↓"; break;
	}
	return <div
		key={channelId}
		className={`linker-group linker-group-accessible`}
		title={`${channelId} ${direction}`}
		style={style}
	>
		{theChar}
	</div>
};


export const LinkerGroups: React.FunctionComponent = () => {
	//set up channel state here, with connection to distrib store
	const myWindowName = System.Window.getCurrent().name;
	const [channelDirections, setChannelDirections] = useState<Record<string,Direction>>({});
	const [allChannels, setAllChannels] = useState<Record<string, DisplayMetadata>>({}); //to be populated when a component using the preload is spawned
	
	//Shared state management
	let distribStoreObj: StoreModel  | null = null;
	const channelStateHandler: ListenerFunction<Record<string,Direction>> = (err, response) => {
		setChannelDirections(response.value);
		debug("CustomLinkerGroups: Received channel directions:", response.value);
	};

	/** Retrieve the distributed store used for state communication. */
	const getDistributedStore = async (): Promise<void> => {
		return new Promise(async (resolve, reject)=>{
			const setHandlers = async (storeObj: StoreModel) => {
				distribStoreObj = storeObj;
				
				//just retrieve the channels, we need the initial state and it should not change
				const {err, data} = await distribStoreObj.get<Record<string, DisplayMetadata>>([STATE_DISTRIBUTED_STORE_ALLCHANNELS_FIELD]);
				if (err || !data) { errorLog("Failed to retrieve all channels!"); }
				else {
					setAllChannels(data);
					debug("CustomLinkerGroups: Received all channels:", data);
				}
				
				//now retrieve this window's state
				const {err: err2, data: data2} = await distribStoreObj.get<Record<string, Direction>>([STATE_DISTRIBUTED_STORE_STATE_FIELD, myWindowName]);
				if (err2 || !data2) { debug("Failed to retrieve channel directions state for this window! It may not have been setup yet, deferring to listener."); }
				else {
					setChannelDirections(data2);
					debug("CustomLinkerGroups: Received channel directions:", data2);
				}
				//now listen to this window's state for changes
				distribStoreObj.addListener([STATE_DISTRIBUTED_STORE_STATE_FIELD, myWindowName], channelStateHandler);
				
				debug(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} connected`);
			};
			const {err,data: storeObject} = await FEAGlobals.FSBL.Clients.DistributedStoreClient.getStore({
				store: STATE_DISTRIBUTED_STORE_NAME,
				global: true
			});
			if (err || !storeObject) {
				errorLog(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} could not be retrieved`, err);
				reject(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} could not be retrieved, see log for details`);
			} else {
				await setHandlers(storeObject);
				resolve()
			}
		});
		
	};

	const unsubscribeDistributedStore = () => {
		distribStoreObj?.removeListener([STATE_DISTRIBUTED_STORE_STATE_FIELD, myWindowName], channelStateHandler);
		distribStoreObj?.removeListener([STATE_DISTRIBUTED_STORE_ALLCHANNELS_FIELD], channelStateHandler);
	};

	useEffect(() => {
		getDistributedStore();
		return () => {
			unsubscribeDistributedStore();
		};
	}, []);

	return (
		<div className="linker-groups">
			{Object.keys(allChannels).map((channelId) => {
				const active = !!channelDirections[channelId];
				const direction = channelDirections[channelId];

				return (
					active && (directionIcon(allChannels[channelId].color ?? "#8781BD", direction, channelId, ))
				);
			})}
		</div>
	);
};
