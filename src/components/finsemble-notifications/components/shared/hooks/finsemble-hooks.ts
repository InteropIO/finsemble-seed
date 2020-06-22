import * as React from "react";

const { useState, useEffect } = React;

const { WindowClient, RouterClient } = FSBL.Clients;

const { publish, subscribe, unsubscribe } = RouterClient;

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
	}, []);

	return [message, pub];
}

const getWindowSpawnData = () => WindowClient.getSpawnData();

const bringWindowToFront: Function = () => WindowClient.bringWindowToFront();

export { getWindowSpawnData, usePubSub, bringWindowToFront };

export default { getWindowSpawnData, usePubSub, bringWindowToFront };
