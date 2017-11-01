/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

"use strict";
var RouterTransport = require("../common/routerTransport");
var Utils = require("../common/util");
var ConfigUtil = require("../common/configUtil");
var Validate = require("../common/validate"); // Finsemble args validator
var queue = []; // should never be used, but message sent before router ready will be queue

var Logger = require("./logger");
Logger.system.log("Starting RouterClient");


/**
 * @introduction
 *
 * <h2>Event Router Client</h2>
 *
 * This module contains the RouterClient for sending and receiving events between Finsemble components and services.  See <a href=tutorial-usingTheEventRouter.html>Event Router Tutorial</a> for an overview of the router's functionality.
 *
 * *Event router callbacks for incoming messages are always in the form `callback(error, event)`.  If `error` is null, then the incoming data is always in `event.data`. If error is set, it contains a diagnotic object and message.  On error, the `event` parameter is not undefined.*
 *
 *
 * @constructor
 * @hideConstructor true
 * @publishedName RouterClient
 * @param {string} thisClientName router client name for human readable messages
 * @param {string=} transportName router transport name, currently either "SharedWorker" or "OpenFinBus" (usually this is autoconfigured internally but can be selected for testing or special configurations)
 */
var RouterClientConstructor = function (params) {
	Validate.args(params, "object") && Validate.args2("params.clientName", params.clientName, "string", "params.transportName", params.transportName, "string=");

	///////////////////////////
	// Private Data
	///////////////////////////
	var thisClientName = params.clientName;
	var transportName = params.transportName;
	var handshakeHandler;
	var timeCalibrationHandler;
	var mapListeners = {};
	var mapResponders = {};
	var mapPubSubResponders = {};
	var mapPubSubResponderState = {};
	var mapPubSubResponderRegEx = {};
	var pubsubListOfSubscribers = {};
	var mapSubscribersID = {};
	var mapSubscribersTopic = {};
	var mapQueryResponses = {};
	var mapQueryResponseTimeOut = {};
	var clientIDCounter = 1000;
	var clientName;
	var transport = false;
	var isRouterReady = false;
	var isParentWaiting = false;
	var parentReadyCallbackQueue = []; // must be queue because may be multiple waiters
	var self = this;

	/////////////////////////////////////////////////////////////////////
	// Private Message Contructors for Communicating with RouterService
	/////////////////////////////////////////////////////////////////////

	function InitialHandshakeMessage() {
		this.header = {
			"origin": clientName,
			"type": "initialHandshake",
		};
	}
	function TimeCalibrationHandshakeMessage(clientBaseTime, serviceBaseTime) {
		this.header = {
			"origin": clientName,
			"type": "timeCalibration",
		};
		this.clientBaseTime = clientBaseTime;
		this.serviceBaseTime = serviceBaseTime;
	}
	function AddListenerMessage(channel) {
		this.header = {
			"origin": clientName,
			"type": "addListener",
			"channel": channel
		};
	}
	function TransmitMessage(toChannel, data) {
		this.header = {
			"origin": clientName,
			"type": "transmit",
			"channel": toChannel
		};
		this.data = data;
	}
	function RemoveListenerMessage(channel) {
		this.header = {
			"origin": clientName,
			"type": "removeListener",
			"channel": channel
		};
	}
	function addResponderMessage(channel) {
		this.header = {
			"origin": clientName,
			"type": "addResponder",
			"channel": channel
		};
	}
	function QueryMessage(queryID, channel, data) {
		this.header = {
			"origin": clientName,
			"type": "query",
			"queryID": queryID,
			"channel": channel
		};
		this.data = data;
	}
	function QueryResponseMessage(queryID, error, data) {
		this.header = {
			"origin": clientName,
			"type": "queryResponse",
			"queryID": queryID,
			"error": error
		};
		this.data = data;
	}
	function RemoveResponderMessage(channel) {
		this.header = {
			"origin": clientName,
			"type": "removeResponder",
			"channel": channel
		};
	}
	function SubscribeMessage(subscribeID, topic) {
		this.header = {
			"origin": clientName,
			"type": "subscribe",
			"subscribeID": subscribeID,
			"topic": topic
		};
	}
	function UnsubscribeMessage(subscribeID, topic) {
		this.header = {
			"origin": clientName,
			"type": "unsubscribe",
			"subscribeID": subscribeID,
			"topic": topic
		};
	}
	function PublishMessage(topic, data) {
		this.header = {
			"origin": clientName,
			"type": "publish",
			"topic": topic
		};
		this.data = data;
	}
	function NotifyMessage(subscribeID, topic, error, data) {
		this.header = {
			"origin": clientName,
			"type": "notify",
			"subscribeID": subscribeID,
			"topic": topic,
			"error": error
		};
		this.data = data;
	}
	function AddPubSubResponderMessage(topic) {
		this.header = {
			"origin": clientName,
			"type": "addPubSubResponder",
			"topic": topic
		};
	}
	function RemovePubSubResponderMessage(topic) {
		this.header = {
			"origin": clientName,
			"type": "removePubSubResponder",
			"topic": topic
		};
	}
	function JoinGroupMessage(group) {
		this.header = {
			"origin": clientName,
			"type": "joinGroup",
			"group": group
		};
	}
	function LeaveGroupMessage(group) {
		this.header = {
			"origin": clientName,
			"type": "leaveGroup",
			"group": group
		};
	}
	function GroupTransmitMessage(group, toChannel, message, data) {
		this.header = {
			"origin": clientName,
			"type": "groupTransmit",
			"group": group,
			"channel": toChannel
		};
		this.data = data;
	}

	//////////////////////
	// Private Functions
	//////////////////////

	// router client is being terminated so cleanup
	function destructor(event) {
		var finWindow = fin.desktop.Window.getCurrent();
		Logger.system.info("RouterClient: shutting down on event: " + JSON.stringify(event));
		self.disconnectAll(); // this will let the router know the client is terminating
		finWindow.removeEventListener("closed", destructor);
	}

	// invoked when router init is complete
	function onReadyCallBack() {
		Logger.system.debug("RouterClient Ready: onReadyCallBack invoked", self);
		isRouterReady = true;

		// invoke all the parent callbacks waiting for router to be ready
		while (parentReadyCallbackQueue.length > 0) {
			Logger.system.debug("RouterClient parentReady invoked");
			var nextParentCallback = parentReadyCallbackQueue.shift();
			nextParentCallback();
		}
	}

	// called once on router-client creation
	function constructor(thisClientName, transportName) {
		clientName = thisClientName + "." + window.name;
		console.log("Router", clientName);
		var callbackCounter = 0;

		fin.desktop.main(function () { // wait for openfin to be ready
			if (callbackCounter++ === 0) { // this check should  not be needed; patch for OpenFin bug which invokes callback twice
				// catch "window closing" event so can cleanup
				var finWindow = fin.desktop.Window.getCurrent();
				window.addEventListener("unload", destructor); // this is the correct event to catch but
				finWindow.addEventListener("closed", destructor); // this is the correct event to catch but currently doesn't work on mac
				ConfigUtil.getExpandedRawManifest(function (manifest) {
					Logger.system.debug("Router getExpandedRawManifest", manifest);
					//If manifest is a string, then there was an error getting the manifest because in a seperate application
					if (!manifest || typeof (manifest) === "string") {
						Logger.system.error("getExpandedRawManifest failed -- fatal error", manifest);
					} else {
						asyncConnectToEventRouter(manifest, clientName, transportName, onReadyCallBack); /**** establish connection to router service ****/
					}
				}, function (err) { Logger.system.error(err); });
			}
		});
	}

	// connects to event-router service
	function asyncConnectToEventRouter(manifest, clientName, transportName, onReadyCallBack) {
		var transportNotSpecified = (typeof (transportName) === "undefined");
		var myTimer;
		var myRetryCounter = 0;
		var isFinished = false;

		var routerParams = {
			routerDomainRoot: manifest.finsemble.moduleRoot,
			routerSharedWorker: manifest.finsemble.moduleRoot + "/common/routerSharedWorker.js",
			forceRouterToOFB: manifest.finsemble.forceRouterToOFB
		};
		Logger.system.debug("RouterClient", "MANIFEST ROUTER PARMAS", routerParams);

		if (transportNotSpecified) {
			transport = RouterTransport.getRecommendedTransport(routerParams, incomingMessageHandler, clientName, "RouterService")
				.then(transportReady)
				.catch(errHandler);
		} else { // tranport specified...typically only for regression testing
			transport = RouterTransport.getTransport(routerParams, transportName, incomingMessageHandler, clientName, "RouterService")
				.then(transportReady)
				.catch(errHandler);
		}

		function transportReady(transportObj) {
			Logger.system.debug("RouterClient: transport ready", "TRANSPORT OBJECT", transportObj);
			transport = transportObj;
			handshakeHandler = finished; // set function to receive handshake response
			sendHandshake();
			myTimer = setInterval(sendHandshake, 250); // start time to retry if response not recieved back from router service
		}

		function sendHandshake() {
			Logger.system.debug("RouterClient: sendHandshake");
			sendToRouterService(new InitialHandshakeMessage());
			if (myRetryCounter++ > 20) {
				Logger.system.error("RouterClient: failure to connect to router service");
				clearInterval(myTimer);
			}
		}

		function finished(transportObj) {
			if (!isFinished) { // ensure only invoked once
				Logger.system.debug("RouterClient connected: starting " + clientName + " with transport " + transport.identifier());
				isFinished = true;
				clearInterval(myTimer);
				if (queue) { // this should not happen with proper startup order, which waits on routerClient to be ready
					for (var i = 0; i < queue.length; i++) {
						Logger.system.debug("RouterClient: firing queued msg");
						var msg = queue[i];
						transport.send(msg);
					}
				}
				// notify initialization is complete
				if (onReadyCallBack) {
					onReadyCallBack();
				}
			}
		}

		function errHandler(errorMessage) {
			Logger.system.error(errorMessage);
		}
	}

	// provides unique id within one router client for queries
	function clientID() {
		return clientName + "." + (++clientIDCounter);
	}

	// returns true if this routerClient originated the message
	function originatedHere() {
		return this.header.origin === this.header.lastClient;
	}

	// invoke client callbacks in the input array (that are attached to a specific channel and listener type)
	function invokeListenerCallbacks(map, message) {
		var clientCallbackArray = map[message.header.channel];
		if (clientCallbackArray === undefined) {
			Logger.system.warn("RouterClient: no listener for incoming transmit on channel " + message.header.channel + " from " + message.header.origin, message);
		} else {
			message.originatedHere = originatedHere;// add local function to test origin
			for (var i = 0; i < clientCallbackArray.length; i++) { // for each callback defined for the channel
				if (!Logger.isLogMessage(message.header.channel)) { // logger messages
					Logger.system.info("RouterClient: incoming transmit", "CHANNEL", message.header.channel, "FROM", message.header.origin, "MESSAGE", message);
				}
				clientCallbackArray[i](null, message); // invoke the callback; the error parameter is always null for this case
			}
		}
	}

	function sendQueryResponse(err, responseData) {
		Logger.system.info("RouterClient: outgoing query response", "RESPONSE DATA", responseData, "QUERY ID", this.header.queryID);
		sendToRouterService(new QueryResponseMessage(this.header.queryID, err, responseData));
	}

	// invoke responder-listener callback (attached to a specific channel)
	function invokeResponderCallback(map, queryMessage) {
		var responderCallback = map[queryMessage.header.channel];
		if (responderCallback === undefined) {
			Logger.system.warn("RouterClient: no query responder define on channel " + queryMessage.header.channel + " incoming from " + queryMessage.header.origin, queryMessage);
			responderCallback(null, queryMessage); // invoke the callback (no error), queryMessage);
		} else {
			if (!queryMessage.header.error) {
				queryMessage.originatedHere = originatedHere; // add local function to test origin
				queryMessage.sendQueryResponse = sendQueryResponse; // add callback function to message so responder can respond to query
				Logger.system.info("RouterClient: incoming query", "CHANNEL", queryMessage.header.channel, "FROM", queryMessage.header.origin, "QUERY MESSAGE", queryMessage);
				responderCallback(null, queryMessage); // invoke the callback (no error)
			} else { // invoke the callback with error since  flag in message (from router service)
				Logger.system.warn("RouterClient: queryResponder error", queryMessage);
				responderCallback(queryMessage.header.error, null);
				delete map[queryMessage.header.channel]; // this is a bad responder (e.g. duplicate) so remove it
			}
		}
	}

	// add a callbackHandler into the query-response map for the given queryID
	function addQueryResponseCallBack(map, queryID, responseCallback) {
		map[queryID] = responseCallback;
	}

	// add timer to wait for query response
	function addQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID, channel, timeout) {
		if (timeout > 0) {
			mapQueryResponseTimeOut[newQueryID] = setTimeout(function () {
				Logger.system.warn("RouterClient: timeout waiting on query response on channel " + channel + " for queryID " + newQueryID +
					" on timer " + mapQueryResponseTimeOut[newQueryID] + " timeout=" + timeout);
			}, timeout);
		}
	}

	// delete timer waiting on query response (if it exists)
	function deleteQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID) {
		var theTimer = mapQueryResponseTimeOut[newQueryID];
		if (theTimer !== undefined) {
			clearTimeout(theTimer);
		}
	}

	// invoke query-response callback (that is attached to a specific channel and listener type)
	function invokeQueryResponseCallback(map, responseMessage) {
		var clientCallback = map[responseMessage.header.queryID];
		if (clientCallback === undefined) {
			Logger.system.warn("RouterClient: no handler for incoming query response", "QUERY ID", responseMessage.header.queryID);
		} else {
			// delete any existing timer waiting on the response
			deleteQueryResponseTimeout(mapQueryResponseTimeOut, responseMessage.header.queryID);

			if (!responseMessage.header.error) {
				Logger.system.info("RouterClient: incoming query response", "RESPONSE MESSAGE", responseMessage, "QUERY ID", responseMessage.header.queryID);
				clientCallback(null, responseMessage); // invoke the callback passing the response message
			} else {
				Logger.system.warn("RouterClient: incoming queryResponse error", responseMessage.header, "QUERY ID", responseMessage.header.queryID);
				clientCallback(responseMessage.header.error, responseMessage); // error from router service so pass it back instead of a message
			}
			delete map[responseMessage.header.queryID];
		}
	}

	// add responder callbackHandler for the given channel
	function addResponderCallBack(map, channel, callback) {
		var status = false;
		var clientCallback = map[channel];
		if (clientCallback === undefined) {
			map[channel] = callback;
			status = true;
		}
		return status;
	}

	// support function for sendNotifyToSubscriber -- maintains local list of subscribers for pubsub responder
	function addToPubSubListOfSubscribers(pubsubListOfSubscribers, topic, subscribeID) {
		if (!(topic in pubsubListOfSubscribers)) {
			pubsubListOfSubscribers[topic] = [subscribeID];
		} else {
			pubsubListOfSubscribers[topic].push(subscribeID);
		}
	}

	// support function for addPubSubResponder -- add pubsub responder callbackHandler for the given channel
	function addPubSubResponderCallBack(topic, subscribeCallback, publishCallback, unsubscribeCallback) {
		var status = false;
		var callbacks = mapPubSubResponders[topic.toString()];
		if (callbacks === undefined) {
			if (topic instanceof RegExp) {
				mapPubSubResponderRegEx[topic.toString()] = topic;
				Logger.system.info("RouterClient: PubSub RegEx added for topic " + topic.toString()); // Note: topic may be a RegEx, so use toString() where applicable
			}
			mapPubSubResponders[topic.toString()] = { "subscribeCallback": subscribeCallback, "publishCallback": publishCallback, "unsubscribeCallback": unsubscribeCallback };
			status = true;
		}
		return status;
	}

	// callback function for invokeSubscribePubSubCallback to notify new subscriber
	function sendNotifyToSubscriber(err, notifyData) {
		sendToRouterService(new NotifyMessage(this.header.subscribeID, this.header.topic, err, notifyData));
		if (!err) {
			// add new subscriber to list
			addToPubSubListOfSubscribers(pubsubListOfSubscribers, this.header.topic, this.header.subscribeID);
			Logger.system.info("RouterClient: incoming subscription added", "TOPIC", this.header.topic, "MESSAGE", this);
		} else {
			Logger.system.info("RouterClient: incoming subscription rejected by pubsub responder", "TOPIC", this.header.topic, "MESSAGE", this);
		}
	}

	// for incoming subscribe: invoke notify callback for pubsub responder
	function invokeSubscribePubSubCallback(subscribeMessage) {
		var callbacks = mapPubSubResponders[subscribeMessage.header.topic];

		if (callbacks === undefined) { // if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(subscribeMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					var initialState = mapPubSubResponderState[subscribeMessage.header.topic]; // may already be initial state defined from publish
					if (initialState === undefined) { // if there isn't already state defined then use default from regEx
						initialState = mapPubSubResponderState[key]; // initialize the state from RegEx topic
					}
					mapPubSubResponderState[subscribeMessage.header.topic] = initialState;
					break;
				}
			}
		}

		if (callbacks === undefined) { // if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming subscribe", subscribeMessage);
		} else {
			if (subscribeMessage.header.error) { // the router service uses the subscribe message in this case to return a pubsub error (ToDO: consider a generic error message)
				Logger.system.warn("RouterClient: pubsub error received from router service: " + JSON.stringify(subscribeMessage.header.error));
			} else {
				subscribeMessage.sendNotifyToSubscriber = sendNotifyToSubscriber; // add callback function to message so pubsub responder can respond with Notify message
				if (callbacks.subscribeCallback) {
					subscribeMessage.data = mapPubSubResponderState[subscribeMessage.header.topic];
					callbacks.subscribeCallback(null, subscribeMessage); // invoke the callback (no error)
				} else { // since no subscribe callback defined, use default functionality
					subscribeMessage.sendNotifyToSubscriber(null, mapPubSubResponderState[subscribeMessage.header.topic]); // must invoke from message to set this properly
				}
			}
		}
	}

	// support function for removeSubscriber callback --  remove one subscribeID from array for the given subscription topic
	function removeFromPubSubListOfSubscribers(pubsubListOfSubscribers, topic, subscribeID) {
		var removed = false;
		if (topic in pubsubListOfSubscribers) {
			var list = pubsubListOfSubscribers[topic];
			for (var i = 0; i < list.length; i++) {
				if (subscribeID === list[i]) {
					list.splice(i, 1);
					if (list.length === 0) {
						delete pubsubListOfSubscribers[topic];
					}
					removed = true;
					Logger.system.info("RouterClient: PubSub removeListener", "TOPIC", topic, "FROM", subscribeID);
					break;
				}
			}
		}
		if (!removed) {
			Logger.system.warn("RouterClient: tried to remove non-existance listener on " + topic + " from " + JSON.stringify(subscribeID));
		}
	}

	// callback function for invokeUnsubscribePubSubCallback to remove the subscriber from the subscription
	function removeSubscriber() {
		removeFromPubSubListOfSubscribers(pubsubListOfSubscribers, this.header.topic, this.header.subscribeID);
	}

	// for incoming unsubscribe: invoke unsubscribe callback for pubsub servier
	function invokeUnsubscribePubSubCallback(unsubscribeMessage) {
		var callbacks = mapPubSubResponders[unsubscribeMessage.header.topic];

		if (callbacks === undefined) { // if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(unsubscribeMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					break;
				}
			}
		}

		if (callbacks === undefined) { // if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
		} else {
			unsubscribeMessage.removeSubscriber = removeSubscriber; // add callback function to message for pubsub responder (but must always remove)
			if (callbacks.unsubscribeCallback) {
				Logger.system.info("RouterClient: incoming unsubscribe callback", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
				callbacks.unsubscribeCallback(null, unsubscribeMessage); // invoke the callback (no error)
			} else { // since no unsubscribe callback defined, use default functionality
				Logger.system.info("RouterClient: incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
				unsubscribeMessage.removeSubscriber();
			}
		}
	}

	// callback function for invokePublishPubSubCallback to send Notify
	function sendNotifyToAllSubscribers(err, notifyData) {
		if (!err) {
			mapPubSubResponderState[this.header.topic] = notifyData; // store new state
			var listOfSubscribers = pubsubListOfSubscribers[this.header.topic];
			if (typeof (listOfSubscribers) !== "undefined") { // confirm subscribers to send to, if none then nothing to do
				for (var i = 0; i < listOfSubscribers.length; i++) {
					Logger.system.info("RouterClient: sending pubsub notify", "TOPIC", this.header.topic, "NOTIFY DATA", notifyData);
					sendToRouterService(new NotifyMessage(listOfSubscribers[i], this.header.topic, err, notifyData));
				}
			}
		} else {
			Logger.system.info("RouterClient: income publish rejected by pubsub responder", err, notifyData);
		}
	}

	// for incoming Publish: invoke publish callback for pubsub servier
	function invokePublishPubSubCallback(publishMessage) {
		var callbacks = mapPubSubResponders[publishMessage.header.topic];

		if (callbacks === undefined) { // if undefined then may be a matching RegEx topic
			for (var key in mapPubSubResponderRegEx) {
				if (mapPubSubResponderRegEx[key].test(publishMessage.header.topic)) {
					callbacks = mapPubSubResponders[key];
					break;
				}
			}
		}

		if (callbacks === undefined) { // if still undefined
			Logger.system.warn("RouterClient: no pubsub responder defined for incoming publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
		} else {
			publishMessage.sendNotifyToAllSubscribers = sendNotifyToAllSubscribers; // add callback function to message so pubsub responder can respond to publish
			if (callbacks.publishCallback) {
				Logger.system.info("RouterClient: incoming PubSub publish callback invoked", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
				callbacks.publishCallback(null, publishMessage); // invoke the callback (no error)
			} else { // since no pubish callback defined, use default functionality
				Logger.system.info("RouterClient: incoming PubSub publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
				publishMessage.sendNotifyToAllSubscribers(null, publishMessage.data); // must call from publish message (like a callback) so 'this' is properly set
			}
		}
	}

	// for incoming Notify: invoke notify callback (that are attached to a specific channel and listener type)
	function invokeNotifyCallback(mapSubscribersID, notifyMessage) {
		var notifyCallback = mapSubscribersID[notifyMessage.header.subscribeID];
		if (notifyCallback === undefined) {
			Logger.system.warn("RouterClient: no subscription handler defined for incoming notify for subscriberID", notifyMessage.header.subscribeID, notifyMessage);
		} else {
			if (!notifyMessage.header.error) {
				notifyMessage.originatedHere = originatedHere;// add local function to test origin
				Logger.system.info("RouterClient: incoming PubSub notify", "SUBSCRIBER ID", notifyMessage.header.subscribeID, "NOTIFY MESSAGE", notifyMessage);
				notifyCallback(null, notifyMessage); // invoke the callback passing the response message
			} else {
				Logger.system.info("RouterClient: incoming PubSub notify error for subscriberID", "SUBSCRIBER ID", notifyMessage.header.subscribeID, "NOTIFY MESSAGE", notifyMessage);
				notifyCallback(notifyMessage.header.error, notifyMessage); // error from router service so pass it back instead of a message
			}
		}
	}

	// outgoing Unsubscribe: remove subscriber callbackHandler for the given channel
	function removeSubscriberCallBack(mapSubscribersID, subscribeID) {
		var status = false;
		var notifyCallback = mapSubscribersID[subscribeID];
		if (notifyCallback !== undefined) {
			delete mapSubscribersID[subscribeID];
			status = true;
		}
		return status;
	}

	// for outgoing addSubscriber -- add a callback Handler for the subscribe
	function addSubscriberCallBack(mapSubscribersID, subscribeID, notifyCallback, topic) {
		mapSubscribersID[subscribeID] = notifyCallback;
		mapSubscribersTopic[subscribeID] = topic;

	}

	// for removePubSubResponder: remove responder callbackHandler for the given channel
	function removeResponderCallBack(map, channel) {
		var status = false;
		var clientCallback = map[channel];
		if (clientCallback !== undefined) {
			delete map[channel];
			status = true;
		}
		return status;
	}

	// for addListener: add a callbackHandler into the specified map (which depends on listener type) for the given channel
	function addListenerCallBack(map, channel, callback) {
		var firstChannelClient = false;
		var clientCallbackArray = map[channel];
		if (clientCallbackArray === undefined || clientCallbackArray.length === 0) {
			map[channel] = [callback];
			firstChannelClient = true;
		} else {
			clientCallbackArray.push(callback);
		}
		return firstChannelClient;
	}

	// for removeListener: remove a callbackHandler from the specified map (which depends on listener type) for the given channel
	function removeListenerCallBack(map, channel, callback) {
		var lastChannelClient = false;
		var clientCallbackArray = map[channel];
		if (clientCallbackArray !== undefined) {
			var index = clientCallbackArray.indexOf(callback);
			if (index > -1) {
				clientCallbackArray.splice(index, 1);
				if (clientCallbackArray.length === 0) {
					lastChannelClient = true;
				}
			} else {
				Logger.system.warn("no listener defined for channel: " + channel);
			}
		}
		return lastChannelClient;
	}

	// route incoming message to appropriate callback, which depends on the message type and channel
	function routeIncomingMessage(incomingMessage) {
		Logger.system.verbose("Incoming Message Type", incomingMessage.header.type, incomingMessage);
		switch (incomingMessage.header.type) {
		case "transmit":
			invokeListenerCallbacks(mapListeners, incomingMessage);
			break;
		case "query":
			invokeResponderCallback(mapResponders, incomingMessage);
			break;
		case "queryResponse":
			invokeQueryResponseCallback(mapQueryResponses, incomingMessage);
			break;
		case "notify":
			invokeNotifyCallback(mapSubscribersID, incomingMessage);
			break;
		case "publish":
			invokePublishPubSubCallback(incomingMessage);
			break;
		case "subscribe":
			invokeSubscribePubSubCallback(incomingMessage);
			break;
		case "unsubscribe":
			invokeUnsubscribePubSubCallback(incomingMessage);
			break;
		case "timeCalibration":
			timeCalibrationHandler(incomingMessage);
			break;
		case "initialHandshakeResponse":
			handshakeHandler();
			break;
		default:
		}
	}

	// *** all incoming messages from underlying transport arrive here ***
	// although incoming transport information is available, it is not passed on because not needed
	function incomingMessageHandler(incomingTransportInfo, message) {
		// ToDo: good place to put a function to validate incoming message/data
		message.header.lastClient = clientName; // add last client for diagnostics
		message.header.incomingTransportInfo = incomingTransportInfo;
		routeIncomingMessage(message);
	}

	// *** all outbound messages exit here though the appropriate transport ***
	function sendToRouterService(message) {
		Logger.system.verbose("Outgoing Message", message.header.type, message);
		if (!transport || (transport instanceof Promise)) {
			Logger.system.warn("RouterClient: Queuing message since router initialization not complete", message);
			queue.push(message);
		} else {
			transport.send(message);
		}
	}


	/////////////////////////////////////////////
	// Public Functions -- The Router Client API
	/////////////////////////////////////////////

	/**
	 * Get router client name.
	 *
	 * @param {string} newClientName string identify the client
	 * FSBL.Clients.RouterClient.setClientName("MyComponent");
	 * @private
	 */
	this.getClientName = function () {
		Logger.system.debug("RouterClient.getClientName", clientName);
		return clientName;
	};

	/**
	 * Checks if router is ready. May be invoked multiple times. Invokes cb when ready, which may be immediately.  Router is not ready until underlying transport to router service is ready.
	 *
	 * @param {function} cb callback function to invoke when router is ready
	 */
	this.onReady = function (cb) {
		Validate.args(cb, "function");
		if (isRouterReady) {
			Logger.system.debug("Router Ready: invoking parentReady callback");
			cb();
		} else {
			Logger.system.debug("Router Ready: queuing parentReady callback");
			parentReadyCallbackQueue.push(cb);
		}
	};

	/**
	 * Estimates offset to align the reference time with Router Service.  Does this by exchanging messages with RouterService, getting the service's time, and estimating communication delay.
	 *
	 * @private
	 */
	this.calibrateTimeWithRouterService = function (callback) {
		const TARGET_HANDSHAKE_COUNT = 5;
		var handshakeCounter = 0;
		var timeOffset;
		var offsetForFastest;
		var fastestRRT = Infinity;

		function calibrationCalculation(finalHandshakeMessage) {
			var timeOffset = 0;
			for (var i = 1; i < TARGET_HANDSHAKE_COUNT; i++) {
				var startClientTime = finalHandshakeMessage.clientBaseTime[i - 1];
				var stopClientTime = finalHandshakeMessage.clientBaseTime[i];
				var rtt = stopClientTime - startClientTime; // round-trip time
				var serviceTime = finalHandshakeMessage.serviceBaseTime[i - 1];
				var offset = serviceTime - (startClientTime + (rtt / 2));
				if (rtt < fastestRRT) {
					fastestRRT = rtt;
					offsetForFastest = offset;
				}
				timeOffset += offset;
				Logger.system.debug("calibrationCalculation Intermediate Values", "lastRRT", rtt, "lastOffset", offset, "fastestOffset", offsetForFastest, "fastestRRT", fastestRRT);
			}
			timeOffset /= (TARGET_HANDSHAKE_COUNT - 1);
			Logger.system.debug("RouterClient calibrationCalculation", "Average Offset", timeOffset, "Choosen FastestOffset", offsetForFastest, finalHandshakeMessage);
			callback(offsetForFastest); // use the offset with the shortest RTT since it is often the most accurate
		}

		function timeCalibrationHandlerFunction(message) {
			handshakeCounter++;
			if (handshakeCounter > TARGET_HANDSHAKE_COUNT) {
				calibrationCalculation(message); // enough handshake data gather, so do the calibration
			} else {
				message.clientBaseTime.push(window.performance.timing.navigationStart + window.performance.now());
				sendToRouterService(new TimeCalibrationHandshakeMessage(message.clientBaseTime, message.serviceBaseTime));
			}
		}

		timeCalibrationHandler = timeCalibrationHandlerFunction; // used in routeIncomingMessage to route handshake response back to handler
		timeCalibrationHandler(new TimeCalibrationHandshakeMessage([], [])); // invoke first time to start exchanging handshakes; will be invoked each time handshake message received back from FouterService
	};

	/**
	 * Backward compatibility?
	 */
	this.ready = this.onReady;
	/**
	 * Add listener for incoming transmit events on specified channel. Each of the incoming events will trigger the specified event handler. The number of listeners is not limited (either local to this Finsemble window or in a seperate Finsemble window).
	 *
	 * See [transmit]{@link RouterClientConstructor#transmit} for sending a cooresponding event message to listener. See [removeListener]{@link RouterClientConstructor#removeListener} to remove the listener.
	 *
	 * @param {string} channel any unique string to identify the channel (must match correspond transmit channel name)
	 * @param {function} eventHandler function (see example below)
	 * @example
	 *
	 * FSBL.Clients.RouterClient.addListener("SomeChannelName", function (error, response) {
			if (error) {
				Logger.system.log("ChannelA Error: ' + JSON.stringify(error));
			} else {
				var data = response.data;
				Logger.system.log("ChannelA Response: ' + JSON.stringify(response));
			}
	 * });
	 *
	 */
	this.addListener = function (channel, eventHandler) {
		Logger.system.info("RouterClient.addListener", "CHANNEL", channel);
		Validate.args(channel, "string", eventHandler, "function");
		var firstChannelClient = addListenerCallBack(mapListeners, channel, eventHandler);
		if (firstChannelClient) {
			sendToRouterService(new AddListenerMessage(channel));
		}
	};

	/**
	 * Transmit event to all listeners on the specified channel. If no listeners the event is discarded without error. All listeners to the channel in this Finsemble window and other Finsemble windows will receive the transmit.
	 *
	 * See [addListener]{@link RouterClientConstructor#addListener} to add a listener to receive the transmit.
	 *
	 * @param {string} toChannel any unique string to identify the channel (must match correspond listener channel name)
	 * @param {any} event any object or primitive type to be transmitted
	 * @example
	 *
	 * FSBL.Clients.RouterClient.transmit("SomeChannelName", event);
	 *
	 */
	this.transmit = function (toChannel, event) {
		if (!Logger.isLogMessage(toChannel)) { // logger messages
			Logger.system.info("RouterClient.transmit", "TO CHANNEL", toChannel, "EVENT", event);
		}
		Validate.args(toChannel, "string", event, "any");
		sendToRouterService(new TransmitMessage(toChannel, event));
	};

	/**
	 * Remove event listener from specified channel for the specific event handler (only listeners created locally can be removed).
	 *
	 * See [addListener]{@link RouterClientConstructor#addListener} for corresponding add of a listener.
	 *
	 * @param {string} channel unique channel name to remove listener from
	 * @param {function} eventHandler function used for the event handler when the listener was added
	 */
	this.removeListener = function (channel, eventHandler) {
		Logger.system.info("RouterClient.removelistener", "CHANNEL", channel, "EVENT HANDLER", eventHandler);
		Validate.args(channel, "string", eventHandler, "function");
		var lastChannelListener = removeListenerCallBack(mapListeners, channel, eventHandler);
		if (lastChannelListener) {
			sendToRouterService(new RemoveListenerMessage(channel));
		}
	};

	/**
	 * Add query responder to the specified channel (only one responder allowed per channel within the Finsemble application). The responder's queryEventHander function will receive all incoming queries for the specified channel (whether from this Finsemble window or remote Finsemble windows).
	 *
	 * See [query]{@link RouterClientConstructor#query} for sending a corresponding query-event message to this responder.
	 *
	 * @param {string} channel any unique string to identify the channel (must match correspond query channel name); only one responder allower per channel
	 * @param {function} queryEventHandler function to handle the incoming query (see example below); note incoming queryMessage contains function to send response
	 * @example
	 *
	 * FSBL.Clients.RouterClient.addResponder("ResponderChannelName", function (error, queryMessage) {
	 *	if (error) {
	 *		Logger.system.log('addResponder failed: ' + JSON.stringify(error));
	 *	} else {
	 *		// process income query message
	 *		queryMessage.sendQueryResponse(null, queryMessage.data); // A QUERY RESPONSE MUST BE SENT
	 *	}
	 * });
	 *
	 */
	this.addResponder = function (channel, queryEventHandler) {
		Logger.system.info("RouterClient.addResponder", "CHANNEL", channel);
		Validate.args(channel, "string", queryEventHandler, "function");
		var status = addResponderCallBack(mapResponders, channel, queryEventHandler);
		if (status) {
			sendToRouterService(new addResponderMessage(channel));
		} else {
			Logger.system.warn("RouterClient.addResponder: Responder already locally defined for channel " + channel);
			queryEventHandler({
				"RouteClient QueryError": "Responder already locally defined for channel"
			}, null); // immediately invoke callback passing error
		}
	};

	/**
	 * Send a query to responder listening on specified channel. The responder may be in this Finsemble window or another Finsemble window.
	 *
	 * See [addResponder]{@link RouterClientConstructor#addResponder} to add a responder to receive the query.
	 *
	 * @param {any} responderChannel any unique string to identify the channel (must match correspond responder channel name)
	 * @param {object} queryEvent event message sent to responder
	 * @param {any=} params this object currently can carry only a timeout value (e.g. { timeout: 3000 }) for a query-response timer.  Timer defaults to 5000 milliseconds is no params value is passed in.  A timer is set only when timeout > 0. If the timer expires, only a warning message is display for diagnostics.
	 * @param {function} responseEventHandler event handler to receive in query response (sent from the responder for the specified channel)
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
	this.query = function (responderChannel, queryEvent, params, responseEventHandler) {
		var newQueryID = clientID();
		var timestamp = window.performance.timing.navigationStart + window.performance.now();
		var navstart = window.performance.timing.navigationStart;
		var timenow = window.performance.now(); // these timer values used for logging diagnostices

		Logger.system.info("RouterClient.query", "RESPONDER CHANNEL", responderChannel, "QUERY EVENT", queryEvent, "PARAMS", params, "QUERYID", newQueryID, { timestamp, navstart, timenow });
		if (arguments.length === 3) {
			responseEventHandler = params;
			params = { timeout: 5000 };
		}
		Validate.args(responderChannel, "string", queryEvent, "any=", params, "object=", responseEventHandler, "function");
		params = params || {};
		Validate.args2("params.timeout", params.timeout, "number");

		addQueryResponseCallBack(mapQueryResponses, newQueryID, responseEventHandler);
		addQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID, responderChannel, params.timeout);
		sendToRouterService(new QueryMessage(newQueryID, responderChannel, queryEvent));
	};

	/**
	 * Remove query responder from specified channel. Only a locally added responder can be removed (i.e. a responder defined in the same component or service).
	 *
	 * See [addResponder]{@link RouterClientConstructor#addResponder} for corresponding add of a query responder.
	 *
	 * @param {string} responderChannel string identifying the channel to remove responder from
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.removeResponder("someChannelName");
	 *
	 */
	this.removeResponder = function (responderChannel) {
		Logger.system.info("RouterClient.removeResponder", "RESPONDER CHANNEL", responderChannel);
		Validate.args(responderChannel, "string");
		var status = removeResponderCallBack(mapResponders, responderChannel);
		if (status) {
			sendToRouterService(new RemoveResponderMessage(responderChannel));
		}
	};

	/**
	 * Add a PubSub responder for specified topic. All subscribes and publishes to the topic will comes to responder (whether from local window or another window). Only one PubSub responder allowed per topic value in Finsemble application; however, the topic value may be a regular-expression representing a set of related topics, in which case the PubSub responder will responder to all matching topics. When a regEx topic is used, the same default functionality is provides for each matching topic -- the difference is only one PubSub responder is needed to cover a set of related topics, plus the same callback handers can be used (if provided).
	 *
	 * All the callback function are optional because each PubSub responder comes with build-in default functionality (described below).
	 *
	 * Note an exact topic match will take precedence over a regEx match, but otherwise results are unpredictable for overlapping RegEx topics.
	 *
	 * See [subscribe]{@link RouterClientConstructor#subscribe} and [publish]{@link RouterClientConstructor#publish} for corresponding functions sending to the PubSub responder.
	 *
	 * @param {string} topic unique topic for this responder, or a topic RegEx (e.g. '/abc.+/') to handle a set of topics
	 * @param {object} initialState initial state for the topic (defaults to empty struct); can be any object
	 * @param {object=} params optional parameters
	 * @param {function=} params.subscribeCallback allows responder know of incoming subscription and accept or reject it (default is to accept)
	 * @param {function=} params.publishCallback allows responder to use the publish data to form a new state (default is the publish data becomes the new state)
	 * @param {function=} params.unsubscribeCallback allows responder to know of the unsubscribe, but it must be accepted (the default accepts)
	 * @param {function=} callback optional callback(err,res) function. If addPubSubResponder failed then err set; otherwise, res set to "success"
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
	this.addPubSubResponder = function (topic, initialState, params, callback) {
		var error;
		var response;
		Logger.system.info("RouterClient.addPubSubResponder", "TOPIC", topic, "INITIAL STATE", initialState, "PARAMS", params);
		Validate.args(topic, "any", initialState, "object=", params, "object=");
		params = params || {};
		Validate.args2("params.subscribeCallback", params.subscribeCallback, "function=", "params.publishCallback", params.publishCallback, "function=") &&
			Validate.args2("params.unsubscribeCallback", params.unsubscribeCallback, "function=");

		var status = addPubSubResponderCallBack(topic, params.subscribeCallback, params.publishCallback, params.unsubscribeCallback);
		if (status) {
			initialState = initialState || {};
			mapPubSubResponderState[topic.toString()] = Utils.clone(initialState);
			sendToRouterService(new AddPubSubResponderMessage(topic.toString()));
			response = "success";
		} else {
			error = "RouterClient.addPubSubResponder: Responder already locally defined for topic " + topic;
			Logger.system.warn(error);
		}
		if (callback) {
			callback(error, response);
		}
	};

	/**
	 * Remove pubsub responder from specified topic. Only locally created responders (i.e. created in local window) can be removed.
	 *
	 * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder.
	 *
	 * @param {string} topic unique topic for responder being removed (may be RegEx, but if so much be exact regEx used previously with addPubSubResponder)
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.removePubSubResponder("topicABC");
	 *
	 */
	this.removePubSubResponder = function (topic) {
		Logger.system.info("RouterClient.removePubSubResponder", "TOPIC", topic);
		Validate.args(topic, "any");
		var status = removeResponderCallBack(mapPubSubResponders, topic);
		if (status) {
			delete mapPubSubResponderState[topic.toString()]; // remove corresponding state
			delete mapPubSubResponderRegEx[topic.toString()]; // may be a RegEx
			sendToRouterService(new RemovePubSubResponderMessage(topic));
		} else {
			Logger.system.warn("RouterClient.removePubSubResponder failed: Could not find responder for topic " + topic);
		}
	};

	/**
	 * Subscribe to a PubSub Responder. Each responder topic can have many subscribers (local in this window or remote in other windows). Each subscriber immediately (but asyncronouly) receives back current state in a notify; new notifys are receive for each publish sent to the same topic.
	 *
	 * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder to handle the subscribe. See [publish]{@link RouterClientConstructor#publish} for corresponding publish to notify the subscriber.
	 *
	 * @param {string} topic topic being subscribed to
	 * @param {function} notifyCallback invoked for each income notify for the given topic (i.e. initial notify plus for each publish)
	 * @returns subscribe-id object optionally used for unsubscribing later
	 *
	 * @example
	 *
	 * var subscribeId = RouterClient.subscribe("topicABC", function(err,notify) {
	 *		if (!err) {
	 *			var notificationStateData = notify.data;
	 *			// do something with notify data
	 *  	}
	 * });
	 *
	 */
	this.subscribe = function (topic, notifyCallback) {
		Logger.system.info("RouterClient.subscribe", "TOPIC", topic);
		Validate.args(topic, "string", notifyCallback, "function");
		var subscribeID = clientID();
		addSubscriberCallBack(mapSubscribersID, subscribeID, notifyCallback, topic);
		sendToRouterService(new SubscribeMessage(subscribeID, topic));
		return { "subscribeID": subscribeID, "topic": topic };
	};

	/**
	 * Publish to a PubSub Responder, which will trigger a corresponding Notify to be sent to all subscribers (local in this window or remote in other windows). There can be multiple publishers for a topic (again, in same window or remote windows)
	 *
	 * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder to handle the publish (i.e. sending notifications to all subscriber). See [Subscribe]{@link RouterClientConstructor#addPubSubResponder} for corresponding subscription to receive publish results (in the form of a notify event)
	 *
	 * @param {string} topic topic being published to
	 * @param {object} event topic state to be published to all subscriber (unless the SubPub responder optionally modifies in between)
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.publish("topicABC", topicState);
	 *
	 */
	this.publish = function (topic, event) {
		Logger.system.info("RouterClient.publish", "TOPIC", topic, "EVENT", event);
		Validate.args(topic, "string", event, "any");
		sendToRouterService(new PublishMessage(topic, event));
	};

	/**
	 * Unsubscribe from PubSub responder so no more notifications received (but doesn't affect other subscriptions). Only works from the window the PubSub responder was created in.
	 *
	 * See [subscribe]{@link RouterClientConstructor#subscribe} for corresponding subscription being removed.
	 *
	 * @param {object} subscribeID the id return from the corresponding subscribe for the topic
	 *
	 * @example
	 *
	 * FSBL.Clients.RouterClient.unsubscribe(subscribeId);
	 *
	 */
	this.unsubscribe = function (subscribeIDStruct) {
		Logger.system.info("RouterClient.unsubscribe", "SUBSCRIBE ID", subscribeIDStruct);
		Validate.args(subscribeIDStruct, "object") && Validate.args2("subscribeIDStruct.subscribeID", subscribeIDStruct.subscribeID, "string");
		var deletedSubscriber = removeSubscriberCallBack(mapSubscribersID, subscribeIDStruct.subscribeID);
		if (deletedSubscriber) {
			sendToRouterService(new UnsubscribeMessage(subscribeIDStruct.subscribeID, subscribeIDStruct.topic));
		} else {
			Logger.system.warn("RouterClient.unsubscribe: Could not find subscribeID for topic " + subscribeIDStruct.topic);
		}
	};

	/**
	 * Test an incoming router message to see if it originated from the same origin (e.g. a trusted source...not cross-domain). Currently same origin is known only because a sharedWorker transport is used (by definition SharedWorkers do not work cross-domain).  This means any message coming in over the OpenFin IAB will not be trusted; however, by default all same-origin components and services connect to the router using a SharedWorker transport.
	 *
	 * @param {object} incomingMessage an incoming router message (e.g. transmit, query, notification) to test to see if trusted.
	 *
	 * @returns true if message is same origin (i.e. received over SharedWorker transport).
	 * @example
	 *
	 * FSBL.Clients.RouterClient.trustedMessage(incomingRouterMessage);
	 *
	 */
	this.trustedMessage = function (incomingMessage) {
		var isTrusted = false;
		Logger.system.debug("RouterClient.trustedMessage", incomingMessage);
		if (incomingMessage.header.incomingTransportInfo.transportID === "SharedWorker") {
			isTrusted = true;
		}
		return isTrusted;
	};

	/*
	 * @TODO: consider adding disconnectAllListerns(), disconnectAllResponders(), disconnectAllSubscribers()
	*/

	/**
	 * Removes all listeners, responders, and subscribers for this router client -- automatically called when client is shutting down. Can be called multiple times.
	 */
	this.disconnectAll = function () {
		Logger.system.info("RouterClient.disconnectAll");
		for (var channel in mapListeners) {
			Logger.system.debug("RouterClient.disconnectAll is removing listener on " + channel);
			sendToRouterService(new RemoveListenerMessage(channel));
			delete mapListeners[channel];
		}

		for (var responderChannel in mapResponders) {
			Logger.system.debug("RouterClient.disconnectAll is removing responder on " + responderChannel);
			sendToRouterService(new RemoveResponderMessage(responderChannel));
			delete mapResponders[responderChannel];
		}

		for (var topic in mapPubSubResponders) {
			Logger.system.debug("RouterClient.disconnectAll is removing pubsub responder on " + topic);
			sendToRouterService(new RemovePubSubResponderMessage(topic));
			delete mapPubSubResponders[topic.toString()]; // could be a RegEx
			delete mapPubSubResponderState[topic.toString()]; // remove corresponding state
			delete mapPubSubResponderRegEx[topic.toString()]; // may be a RegEx
		}

		for (var subscribeID in mapSubscribersID) {
			var stopic = mapSubscribersTopic[subscribeID];
			Logger.system.debug("RouterClient.disconnectAll is removing subscriber on " + stopic);
			sendToRouterService(new UnsubscribeMessage(subscribeID, stopic));
			delete mapSubscribersID[subscribeID];
			delete mapSubscribersTopic[subscribeID];
		}
	};

	constructor(thisClientName, transportName); // on creation invoke to initialize
};

module.exports = RouterClientConstructor;
