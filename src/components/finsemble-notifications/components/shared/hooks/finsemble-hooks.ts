import * as React from "react";

const { useState, useEffect } = React;

const { LauncherClient, WindowClient, Logger, RouterClient } = FSBL.Clients;

const { addPubSubResponder, publish, subscribe, unsubscribe } = RouterClient;

function usePubSub(topic: string, initialMessage: object = {}): [{ [key: string]: any }, Function] {
	const [message, setMessage] = useState(initialMessage);

	const pub = (value: any) => publish(topic, value);

	useEffect(() => {
		const subscribeId = subscribe(topic, (err, res) => {
			if (err) console.error(err);
			// console.log(res);
			setMessage(res.data);
		});
		return () => {
			unsubscribe(subscribeId);
		};
	}, []); // eslint-disable-line

	return [message, pub];
}

const getWindowSpawnData = () => WindowClient.getSpawnData();

/**
 * send a message over the router to toggle a component
 */
function toggleComponent() {
	// see if the component is in the active descriptors if not it will need loading or some other feedback
	// do we want to show minimize / hide in the case of the center?
	// send a message over the router with the word toggle and then the component can do a !toggle to show or do
	const { windowName, uuid, componentType } = WindowClient.getWindowIdentifier();
}

/**
 * Exposes Electron ClickThrough
 * @param canClickThrough - This should be the visible section of a component
 * @example
 * //clickthrough is enabled and the window will ignore mouse click events
 * enableClickThrough(true)
 */
function enableClickThrough(canClickThrough = false) {
	const options = canClickThrough && { forward: true };
	// WindowClient.setIgnoreMouseEvents(canClickThrough, options);
}

const bringWindowToFront: Function = () => WindowClient.bringWindowToFront();

export { enableClickThrough, toggleComponent, getWindowSpawnData, usePubSub, bringWindowToFront };

export default { enableClickThrough, toggleComponent, getWindowSpawnData, usePubSub, bringWindowToFront };
