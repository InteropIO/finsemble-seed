import { SubscribeCallback, PublishCallback } from "@finsemble/finsemble-core/types/clients/routerClient";

// if Finsemble API clients are in scope use them, if not require them
let Clients = FSBL?.Clients;
if (!Clients) {
	Clients = require("@finsemble/finsemble-core").Clients;
}
const Logger = Clients.Logger;
const RouterClient = Clients.RouterClient;
const LauncherClient = Clients.LauncherClient;

/* Utility functions for creating a RouterPubSub topic that is accessed controlled.
 * Access control examples are provided based on criteria such as the component type 
 * name (same as the appId) or the host name from the current URL of the window.
 * 
 * E.g.
 * // Setup the topic before anyone uses it
 * const topicName = "OAuthAccessToken";
 * const initialState = {access_token: null};
 * await setUpControlledPubSubTopic(topicName, initialState, hostNameTestFn, componentTypeTestFn);
 * 
 * //to subscribe to the topic (will have to pass hostNameTestFn)
 * FSBL.Clients.RouterClient.subscribe(topicName, (err, response) => {
 *		if (err) { 
 *	        // wasn't allowed to subscribe 
 *      }
 *		else { 
 *	        // do something with the content of the topic 
 *			console.log(response.data); 
 *		}
 *	})
 * 
 * //to publish to the topic (will have to pass componentTypeTestFn)
 * const updatedState = { access_token: "xyz" };
 * FSBL.Clients.RouterClient.publish(topicName, updatedState);
 */



/**
 * Utility function for setting up a router PubSub topic that is access controlled 
 * by criteria based on information in the RouterHeader (which can lead you to its
 * conponent type / appId or its current URL).
 * 
 * @param topicName Name for the PubSub topic
 * @param initialState The initial state of the topic when created
 * @param subscribeTestFn Function that determines whether a subscriber should be allowed.
 * @param publishTestFn Function that determines whether a publish should be allowed.
 */
export const setUpControlledPubSubTopic = async (topicName: string, initialState: any, subscribeTestFn: HeaderTestFn, publishTestFn: HeaderTestFn) =>{
	const subscribeCallback: SubscribeCallback = async (error, subscribe) => {
		if (error) {
			Logger.error("Router PubSub subscribeCallback error",error);
		} else {
			//use the subscribeTestFn to check if the subscribing app should be allowed in
			if (await subscribeTestFn(subscribe.header)){
				subscribe.sendNotifyToSubscriber(null, { "NOTIFICATION-STATE": "One" });
			} else {
				subscribe.sendNotifyToSubscriber("You are not allowed to subscribe to this topic");
			}
		}
	}
	const publishCallback: PublishCallback = async (error: any, publish: any) => {
		if (error) {
			Logger.error("Router PubSub publishCallback error",error);
		} else {
			//use the publishTestFn to check if the app trying to publish should be allowed to
			if (await publishTestFn(publish.header)){
				//set the state of the topic and notify subscribers
				publish.sendNotifyToAllSubscribers(null, publish.data);
			} else {
				publish.sendNotifyToSubscriber("You are not allowed to publish to this topic");
			}
			publish.sendNotifyToAllSubscribers(null, publish.data);
		}
	}
	return await RouterClient.addPubSubResponder(
		topicName,
		initialState,
		{	subscribeCallback,
			publishCallback
		}
	);
}

/**
 * Type for test functions used to control access to Router PubSub using information
 * in the Router headers received with subscribe or publish event.
 */
type HeaderTestFn =  (header: {origin: string}) => Promise<boolean>;

/**
 * Example test function that checks the domain of the current URL of the window with a regex.
 */
export const hostNameTestFn: HeaderTestFn = async (header) => {
	//Edit this regex so that it only matches hosts or domains that you want to be able to access the topic
	const allowedDomainsRegex = /finsemble.com$/
	const windowName = getWindowNameFromRouterOrigin(header.origin);
	const descriptor = await getDescriptorForWindowName(windowName);
	const url = descriptor.url;
	if (!url) {
		Logger.log("Window descriptor did not contain a url. Is it a native component?");
		return false;
	}
	const host = new URL(url).host;
	return !!host.match(allowedDomainsRegex);
}

/** 
 * Example test function that checks component type against an array of allowed values. 
 */
export const componentTypeTestFn: HeaderTestFn = async (header) => {
	//Add component type names (same as appId) to this array
	const allowedComponentTypes = ["ChartIQ Example App", "AG-Grid Example Blotter"];
	const windowName = getWindowNameFromRouterOrigin(header.origin);
	const descriptor = await getDescriptorForWindowName(windowName);
	const componentType = descriptor.componentType;
	if (!componentType) { 
		throw new Error("Failed to establish componentType for router header"); 
	}
	return allowedComponentTypes.includes(componentType);
} 

/** 
 * Utility function for extracting windowName from the RouterClient name (origin) 
 */
export const getWindowNameFromRouterOrigin = (origin: string) => {
	let parts = origin.split(".");
	if (parts.length < 2) { throw new Error(`Router origin (${origin}) was not in the expected format`); }
	return parts[1];
};

/** 
 * Utility function for retrieving current URL for a web windowName
 *  (will return null for native components). 
 */
export const getDescriptorForWindowName = async (windowName: string) => {
	let {err, data: descriptors} = await LauncherClient.getActiveDescriptors();
	if (err || !descriptors) {
		throw new Error(`Failed to retrieve active descriptors: ${JSON.stringify(err ? err : descriptors)}`);
	} else {
		return descriptors[windowName];
	}
}