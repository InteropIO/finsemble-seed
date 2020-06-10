import { StandardCallback } from "../globals";
export interface RouterResponse<T> {
	data: T;
	header: {
		channel: string;
		origin: string;
		incomingTransportInfo: {
			port: number;
			transportID: "SharedWorker" | "OpenFinBus";
			lastClient: string;
			origin: string;
		};
		type: string;
	};
}
export interface RouterMessage<T = any> extends RouterResponse<T> {
	options: {
		supressWarnings: boolean;
	};
	originatedHere(): boolean;
}
export interface ResponderMessage<T = any> extends RouterMessage {
	data: T;
	sendQueryResponse(error: string | Error | null, data?: any): any;
}
/**
 * @introduction
 * <h2>Router Client</h2>
 *
 * For communications amongst desktop services, components, or outside the container entirely, Finsemble provides an event infrastructure with high level protocols.
 * The Router is the center of this functionality, sending and receiving messages between windows.
 *
 *
 * See the [Router tutorial](tutorial-TheRouter.html) for an overview.
 *
 * @hideconstructor
 * @constructor
 */
export interface IRouterClient {
	/**
	 * Checks if Router is ready. May be invoked multiple times. Invokes callback when ready, which may be immediately.  Router is not ready until underlying transport to Router Service is ready.
	 *
	 * @param {function} cb Callback function to invoke when Router is ready.
	 */
	onReady(cb: () => void): void;
	/**
     * Adds a listener for incoming transmit events on the specified channel. Each of the incoming events will trigger the specified event handler. The number of listeners is not limited (either local to this Finsemble window or in a separate Finsemble window).
     *
     * See <code>transmit</code> for sending a corresponding event message to the listener. See <code>removeListener</code> to remove the listener.
     *
     * @param {string} channel A unique string to identify the channel (must match corresponding transmit channel name).
     * @param {function} eventHandler A callback handling any possible error and the response (see example below).
     * @example
     *
     * FSBL.Clients.RouterClient.addListener("SomeChannelName", function (error, response) {
            if (error) {
                Logger.system.log("ChannelA Error: " + JSON.stringify(error));
            } else {
                var data = response.data;
                Logger.system.log("ChannelA Response: " + JSON.stringify(response));
            }
     * });
     *
     */
	addListener(
		channel: string,
		eventHandler: StandardCallback<string | Error, RouterMessage>
	): void;
	/**
	 * Transmits an event to all listeners on the specified channel. If there are no listeners on the channel, the event is discarded without error. All listeners on the channel in this Finsemble window and other Finsemble windows will receive the transmit.
	 *
	 * See <code>addListener</code> to add a listener to receive the transmit.
	 *
	 * @param {string} toChannel A unique string to identify the channel (must match corresponding listener channel name).
	 * @param {any} event An object or primitive type to be transmitted.
	 * @param {object} options An object containing options for your transmission.
	 * @param {boolean} options.suppressWarnings By default, the Router will log warnings if you transmit to a channel with no listeners. Set this to true to eliminate those warnings.
	 * @example
	 *
	 * FSBL.Clients.RouterClient.transmit("SomeChannelName", event);
	 *
	 */
	transmit(
		toChannel: string,
		event: any,
		options?: {
			suppressWarnings: boolean;
		}
	): void;
	/**
	 * Removes an event listener from the specified channel for the specific event handler; only listeners created locally can be removed.
	 *
	 * See <code>addListener</code> for corresponding add of a listener.
	 *
	 * @param {string} channel The unique channel name from which to remove the listener.
	 * @param {function} eventHandler Function used for the event handler when the listener was added.
	 */
	removeListener(channel: string, eventHandler: StandardCallback): void;
	/**
	 * Adds a query responder to the specified channel. The responder's <code>queryEventHandler</code> function will receive all incoming queries for the specified channel (whether from this Finsemble window or remote Finsemble windows).
	 *
	 * <b>Note:</b> Only one responder is allowed per channel within Finsemble.
	 *
	 * See <code>query</code> for sending a corresponding query-event message to this responder.
	 *
	 * @param {string} channel A unique string to identify the channel (must match corresponding query channel name); only one responder is allowed per channel.
	 * @param {StandardCallback} queryEventHandler A function to handle the incoming query (see example below); note the incoming <code>queryMessage</code> contains a function to send the response.
	 * @example
	 *
	 * FSBL.Clients.RouterClient.addResponder("ResponderChannelName", function (error, queryMessage) {
	 *	if (error) {
	 *		Logger.system.log('addResponder failed: ' + JSON.stringify(error));
	 *	} else {
	 *		console.log("incoming data=" + queryMessage.data);
	 * 		var response="Back at ya"; // Responses can be objects or strings
	 * 		queryMessage.sendQueryResponse(null, response); // The callback must respond, else a timeout will occur on the querying client.
	 * 	}
	 * });
	 *
	 */
	addResponder<T = any>(
		channel: string,
		queryEventHandler: StandardCallback<string, ResponderMessage<T>>
	): void;
	/**@TODO - Standardize how we do overloads. This is experimental. */
	/**
	 * Sends a query to the responder listening on the specified channel. The responder may be in this Finsemble window or another Finsemble window.
	 *
	 *
	 * See <code>addResponder</code> to add a responder to receive the query.
	 *
	 * @param {string} responderChannel A unique string that identifies the channel (must match the channel name on which a responder is listening).
	 * @param {object} queryEvent The event message sent to the responder.
	 * @param {function} responseEventHandler An event handler to receive the query response (sent from a responder that is listening on this channel).
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.query("someChannelName", {}, function (error, queryResponseMessage) {
	 *	if (error) {
	 *		Logger.system.log('query failed: ' + JSON.stringify(error));
	 *	} else {
	 *		// process income query response message
	 *		var responseData = queryResponseMessage.data;
	 *		Logger.system.log('query response: ' + JSON.stringify(queryResponseMessage));
	 *	}
	 * });
	 *
	 * FSBL.Clients.RouterClient.query("someChannelName", { queryKey: "abc123"}, { timeout: 1000 }, function (error, queryResponseMessage) {
	 *	if (!error) {
	 *		// process income query response message
	 *		var responseData = queryResponseMessage.data;
	 *	}
	 * }); */
	query(
		responderChannel: string,
		queryEvent: any,
		responseEventHandler: StandardCallback
	): Promise<any>;
	/**
	 * Removes the query responder from the specified channel. Only a locally added responder can be removed (i.e., a responder defined in the same component or service).
	 *
	 * See [addResponder]{@link RouterClientConstructor#addResponder} for adding a query responder.
	 *
	 * @param {string} responderChannel String identifying the channel from which to remove the responder.
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.removeResponder("someChannelName");
	 *
	 */
	removeResponder(responderChannel: string): void;
	/**
	 * Adds a PubSub responder for specified topic. All subscriptions and publications to the topic will come to the responder (whether from local window or another window).
	 *
	 * Only one PubSub responder per topic value in Finsemble is allowed; however, the topic value may be a regular-expression representing a set of related topics,
	 * in which case the PubSub responder will respond to all matching topics. When a RegEx topic is used, the same default functionality is provided for each matching topic,
	 * except that only one PubSub responder is needed to cover a set of related topics, and the same callback handlers can be used (if provided).
	 *
	 * You may omit any of the callbacks. If you do, default callbacks will be provided, the behavior of which are described below.
	 *
	 * <b>Note</b>: An exact topic match will take precedence over a RegEx match, but otherwise no specific matching priority is guaranteed for overlapping RegEx topics.
	 *
	 * See <code>subscribe</code> and <code>publish</code> for interacting with a PubSub responder.
	 *
	 * @param {string} topic A unique topic for this responder, or a topic RegEx (e.g. '/abc.+/') to handle a set of topics.
	 * @param {object} initialState The initial state for the topic; defaults to empty object.
	 * @param {object} params Optional parameters.
	 * @param {function} params.subscribeCallback Used to set custom behavior regarding whether an incoming subscribe request is accepted or rejected. The default callback automatically accepts all incoming requests.
	 * @param {function} params.publishCallback Used to set custom behavior in publishing data. The default callback automatically sets the publish data as the new state.
	 * @param {function} params.unsubscribeCallback Used to set custom behavior when receiving an unsubscribe request. The default callback automatically accepts the request by calling <code>.removeSubscriber()</code>. See example code.
	 * @param {function} callback An optional callback function, accepting a possible error and the response. If <code>addPubSubResponder</code> failed, then the error will be set; otherwise, the response will have a value of "success".
	 *
	 * @example
	 *
	 * function subscribeCallback(error, subscribe) {
	 * 	if (subscribe) {
	 * 		// must make this callback to accept or reject the subscribe (default is to accept). First parm is err and second is the initial state
	 * 		subscribe.sendNotifyToSubscriber(null, { "NOTIFICATION-STATE": "One" });
	 * 	}
	 * }
	 * function publishCallback(error, publish) {
	 * 	if (publish) {
	 * 		// must make this callback to send notify to all subscribers (if error parameter set then notify will not be sent)
	 * 		publish.sendNotifyToAllSubscribers(null, publish.data);
	 * 	}
	 * }
	 * function unsubscribeCallback(error, unsubscribe) {
	 * 	if (unsubscribe) {
	 * 		// must make this callback to acknowledge the unsubscribe
	 * 		unsubscribe.removeSubscriber();
	 * 	}
	 * }
	 * FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" },
	 * 	{
	 * 		subscribeCallback:subscribeCallback,
	 * 		publishCallback:publishCallback,
	 * 		unsubscribeCallback:unsubscribeCallback
	 * 	});
	 *
	 *   or
	 *
	 * FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" });
	 *
	 *   or
	 *
	 * FSBL.Clients.RouterClient.addPubSubResponder(\/topicA*\/, { "State": "start" });
	 *
	 */
	addPubSubResponder(
		topic: string | RegExp,
		initialState?: object,
		params?: {
			subscribeCallback?: StandardCallback;
			unsubscribeCallback?: StandardCallback;
			publishCallback?: StandardCallback;
		},
		callback?: (err?: string | Error, result?: string) => void
	): void;
	/**
	 * Removes a PubSub responder from the specified topic. Only locally created responders (i.e. created in the local window) can be removed.
	 *
	 * See <code>addPubSubResponder</code> for corresponding addition of a PubSub responder.
	 *
	 * @param {string} topic Unique topic for responder being removed (may be RegEx, but if so much be exact RegEx used previously with <code>addPubSubResponder</code>).
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.removePubSubResponder("topicABC");
	 *
	 */
	removePubSubResponder(topic: string | RegExp): void;
	/**
	 * Subscribe to a PubSub responder. Each responder topic can have many subscribers (local in this window or remote in other windows). Each subscriber immediately (but asynchronously) receives back current state in a notify; new notifications are received for each publish sent to the same topic.
	 *
	 * See <code>addPubSubResponder</code> for corresponding addition of a PubSub responder to handle the subscribe. See [publish]{@link RouterClientConstructor#publish} for how to publish data to subscribers.
	 *
	 * @param {string} topic A unique string representing the topic being subscribed to.
	 * @param {function} notifyCallback Invoked on immediately upon subscription, then again on each incoming notification for the specified topic.
	 * @returns {object} An object containing a unique id representing the subscription. This can be used later to unsubscribe.
	 *
	 * @example
	 *
	 * var subscribeId = RouterClient.subscribe("topicABC", function(err, notify) {
	 *	if (!err) {
	 *		var notificationStateData = notify.data;
	 *		// do something with notify data
	 *	}
	 * });
	 *
	 *
	 */
	subscribe(
		topic: string,
		notifyCallback: StandardCallback
	): {
		subscribeID: string;
		topic: string;
	};
	/**
	 * Publish to a PubSub Responder, which will trigger a corresponding notification to all subscribers (local in this window or remote in other windows). There may be multiple publishers for a topic (again, in same window or remote windows).
	 *
	 * See <code>addPubSubResponder</code> for corresponding addition of a PubSub publisher (i.e., sending notifications to all subscriber). See <code>Subscribe</code> for corresponding subscription published results (in the form of a <code>Notify</code> event).
	 *
	 * @param {string} topic A unique string representing the topic being published.
	 * @param {object} event The topic state to be published to all subscribers (unless the PubSub responder optionally modifies in between).
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.publish("topicABC", topicState);
	 *
	 */
	publish(topic: string, event: any): void;
	/**
	 * Unsubscribes from a PubSub responder so no more notifications are received (but doesn't affect other subscriptions). Only works from the window the PubSub responder was created in.
	 *
	 * See <code>subscribe</code> for corresponding subscription being removed.
	 *
	 * @param {object} subscribeIDStruct
	 * @param {string} subscribeIDStruct.subscribeID The id returned from the corresponding subscription to the topic.
	 * @param {string} subscribeIDStruct.topic The topic for the subscription.
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.unsubscribe(subscribeId);
	 *
	 */
	unsubscribe(subscribeIDStruct: { subscribeID: string; topic: string }): void;
	/** @TODO - Fix the second sentence - it's confusing. */
	/**
	 * Tests an incoming Router message to see if it originated from the same origin (i.e., a trusted source; not cross-domain).
	 *
	 * Currently, the origin of an incoming Router message is determined by way of the SharedWorker transport. By definition, SharedWorkers do not work across domains.
	 * This means any message coming in over the transport will not be trusted. However, by default, all same-origin components
	 * and services connect to the Router using a SharedWorker transport.
	 * @param {object} incomingMessage An incoming Router message (e.g., transmit, query, notification) to test to see if trusted.
	 *
	 * @example
	 * FSBL.Clients.RouterClient.trustedMessage(incomingRouterMessage);
	 */
	trustedMessage(incomingMessage: any): boolean;
	/**
	 * Removes all listeners, responders, and subscribers for this router client -- automatically called when the client is shutting down. Can be called multiple times.
	 */
	disconnectAll(): void;
}
