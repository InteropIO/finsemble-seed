/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

// This routerTransport module is shared between router clients and the router service.  It supports
// the addition of new transports without any change to the router code. Each transport is
// point-to-point between a router client and the router service (i.e. hub and spoke).  Each router
// client can use a different transport (i.e. the router service connects to them all).

"use strict";
var Utils = require("../common/util");
var console = new Utils.Console("RouterTransport"); // Finsemble console

/**
 * @introduction
 * <h2>Router Transport</h2>
 * **Service-Level Module**.  Manages and contains the point-to-point transports (i.e. Layer 2) supported by Finsemble.
 * Each transport communicates betweew a Finsemble services or component (on one end) and the Finsemble router (on the other end).
 *
 * The OpenFinBus transport is used for cross-domain components (where SharedWorker fails).
 *
 * Requirements for adding a new transport:
 * 1) create new transport object with same interface provided by SharedWorkerTransport and OpenFinTransport in this file.
 * 2) call RouterTransport.addTransport() to make the transport available (see the bottom of this file)
 *
 * Integration into routerService.js is automatic.
 *
 * @namespace RouterTransport
 */
var RouterTransport = {

	activeTransports: {},

	/**
	 * Adds a new type of router transport to pass message between RouterClient and RouterService.
	 *
	 * @param {string} transportName identifies the new transport
	 * @param {object} transportConstructor returns an instance of the new transport
	 */
	addTransport: function (transportName, transportConstructor) {
		this.activeTransports[transportName] = transportConstructor;
		window.console.info("RouterTransport added: " + transportName);
	},

	/**
	 * Gets array of active transports
	 *
	 * @returns array transport names/identifier
	 */
	getActiveTransports: function () {
		var transportNames = [];
		for (var transportIdentifier in this.activeTransports) {
			transportNames.push(transportIdentifier);
		}
		return transportNames;
	},

	/**
	 * Get default transport for event router -- this is the most reliable transport across all contexts
	 *
 	 * @param {object} params parameters for transport
	 * @param {any} incomingMessageHandler
	 * @param {any} source
	 * @param {any} destination
	 * @returns the transport object
	 */
	getDefaultTransport: function (params, incomingMessageHandler, source, destination) {
		return RouterTransport.getTransport(params, "OpenFinBus", incomingMessageHandler, source, destination);
	},

	/**
	 * Get best client transport based on the run-time context. Will only return cross-domain transport if current context is inter-domain.
	 *
 	 * @param {object} params parameters for transport
	 * @param {any} incomingMessageHandler
	 * @param {any} source
	 * @param {any} destination
	 * @returns the transport object
	 */
	getRecommendedTransport: function (params, incomingMessageHandler, source, destination) {
		var newTransport; // return variable

		// Will tell you if the window is in an iframe or not (for future)
		function isInIframe() {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		}

		// returns true if this window's location is in another domain
		function crossDomain() {
			var parser = document.createElement('a');
			parser.href = params.routerDomainRoot;

			var isSameHost = (window.location.hostname === parser.hostname);

			var isSameProtocol = (window.location.protocol === parser.protocol);

			var wport = (window.location.port === undefined) ? window.location.port : 80;
			var pport = (parser.port === undefined) ? parser.port : 80;
			var isSamePort = (wport === pport);

			var isCrossDomain = params.forceRouterToOFB || !(isSameHost && isSamePort && isSameProtocol);
			console.debug("Transport crossDomain=" + isCrossDomain + " (" + params.forceRouterToOFB + ":" + isSameHost + ":" + isSameProtocol + ":" + isSamePort + ")");
			return isCrossDomain;
		}

		// returns name of the best transport for communicating with router service
		function recommendedTransportName() {
			var recommendedName = "SharedWorker"; // default -- fast but doesn't work cross-domain
			if (crossDomain()) {
				recommendedName = "OpenFinBus"; // required for cross-domain event messaging between windows
			}
			return recommendedName;
		}

		var transportName = recommendedTransportName();
		return RouterTransport.getTransport(params, transportName, incomingMessageHandler, source, destination);
	},

	/**
	 * Get a specific transport by name. The transport must be in list of the active transports (i.e. previously added).
	 *
 	 * @param {object} params parameters for transport
	 * @param {any} transportName
	 * @param {any} incomingMessageHandler
	 * @param {any} source
	 * @param {any} destination
	 * @returns the transport object
	 */
	getTransport: function (params, transportName, incomingMessageHandler, source, destination) {
		var self = this;
		return new Promise(function (resolve, reject) {
			var transportConstructor = self.activeTransports[transportName];
			if (transportConstructor) {
				var newTransport = new transportConstructor(params, transportName, incomingMessageHandler, source, destination);
				resolve(newTransport);
			} else {
				reject("unknown transport name: " + transportName);
			}
		});
	}
};

//////////////////////////////////////////////////////////////
// Below all transports are defined then added to active list
//////////////////////////////////////////////////////////////

var RouterTransportImplementation = {}; // a convenience namespace for router-transport implementations

/*
 * Implements the SharedWorker Transport.
 *
 * Required Functions (used by transport clients):
 * 		send(eventMessage) -- transports the event
 * 		identifier() -- returns transport name/identifier
 *
 * @param {object} params parameters for SharedWorker transport
 * @param {object} name the name the transport will be reference by
 * @param {any} parentMessageHandlerParm callback for incoming event
 * @param {any} source for the transport (e.g. "RouterClient" or "RouterService")
 */
RouterTransportImplementation.SharedWorkerTransport = function (params, name, parentMessageHandlerParm, source) {
	var parentMessageHandler;
	var routerThread;
	var transportName;
	var console = new Utils.Console("SharedWorkerTransport." + source); // Finsemble console


	// receives incoming shared-worker messages then passes on to parent with correct "wrapper"
	function sharedWorkerMessageHandler(swMessage) {
		var port = swMessage.data[0];
		var eventMessage = swMessage.data[1];
		var incomingTransportInfo = { "transportID": transportName, "port": port };
		console.debug2("Incoming Transport", incomingTransportInfo, "Message", eventMessage);
		parentMessageHandler(incomingTransportInfo, eventMessage);
	}

	//required function for parent (i.e. routeClient or routeService)
	this.send = function (transport, eventMessage) {
		// handle optional transport parm
		if (arguments.length === 1) {  // clients use just one parm -- eventMessage
			eventMessage = arguments[0];
			transport = null;
			console.debug2("Outgoing Transport", transportName, "Message", eventMessage);
		} else { // router services uses both parameters
			transport = arguments[0];
			eventMessage = arguments[1];
			console.debug2("Outgoing Transport", transport, "Message", eventMessage);
		}
		try {
			routerThread.port.postMessage([transport, eventMessage]);
		}
		catch (e) {
			console.error("routerThread post message failed: " + JSON.stringify(e), "Probable cause is sending illegal data type (e.g. function).");
		}
	};

	//required function for parent (i.e. routeClient or routeService)
	this.identifier = function () {
		return transportName;
	};

	console.debug("SharedWorker " + params.routerSharedWorker + " Initializing: " + source);
	transportName = name;
	parentMessageHandler = parentMessageHandlerParm;
	routerThread = new SharedWorker(params.routerSharedWorker, { name: "Finsemble", credentials: "included" });
	routerThread.port.onmessage = sharedWorkerMessageHandler;
	routerThread.onerror = function (e) {
		console.error("RouteClient SharedWorker Error" + JSON.stringify(e));
	};
	routerThread.port.start();

	if (source === "RouterService") {  // send first message though shared worker to identify router service
		routerThread.port.postMessage({ data: "connect", source: "RouterService" });
	}
};

/*
 * Implements the OpenFin Bus Transport.
 *
 * Required Functions (used by transport clients):
 * 		send(event) -- transports the event
 * 		identifier() -- returns transport name/identifier
 *
 * @param {object} params unused in OpenFin transport
 * @param {object} name the name the transport will be reference by
 * @param {any} parentMessageHandlerParm callback for incoming event
 * @param {any} source for the transport (e.g. "RouterClient" or "RouterService")
 * @param {any} destination for the transport (e.g. "RouterService" or "RouterClient" )
 */
RouterTransportImplementation.OpenFinTransport = function (params, name, parentMessageHandlerParm, source, destination) {
	var parentMessageHandler;
	var transportName;
	var console = new Utils.Console("OpenFinTransport." + source); // Finsemble console
	var uuid = fin.desktop.Application.getCurrent().uuid;

	// receives incoming OpenFin bus messages then passes on to parent with correct "wrapper"
	function openFinMessageHandler(eventMessage, senderUuid, name) {
		var incomingTransportInfo = { "transportID": transportName, "senderUuid": senderUuid, "name": eventMessage.header.origin };
		console.debug2("Incoming Transport", incomingTransportInfo, "Message", eventMessage);
		parentMessageHandler(incomingTransportInfo, eventMessage);
	}

	function subscribeFailure(reason) {
		console.error("OpenFinBus Subscribe Failure: " + reason);
	}

	//required function for the parent (i.e. routeClient or routeService)
	this.send = function (transport, eventMessage) {
		var destTopic;

		// handle optional transport parm
		if (arguments.length === 1) { // client use just one parameter - eventMessage
			destTopic = destination;
			eventMessage = arguments[0];
		} else { // router service uses both parameters
			destTopic = transport.name;
			eventMessage = arguments[1];
		}

		console.debug2("Outgoing Transport", uuid, destTopic, "Message", eventMessage);
		fin.desktop.InterApplicationBus.publish(destTopic, eventMessage,
			function () { }, function (err) { });
	};

	//required function for the parent (i.e. routeClient or routeService)
	this.identifier = function () {
		return transportName;
	};

	transportName = name;
	parentMessageHandler = parentMessageHandlerParm;
	window.console.debug("OpenFinBus Initializing: " + source);
	fin.desktop.InterApplicationBus.subscribe('*', source, openFinMessageHandler, null, subscribeFailure);
};

// add the transports to the available/active list
RouterTransport.addTransport("SharedWorker", RouterTransportImplementation.SharedWorkerTransport);

RouterTransport.addTransport("OpenFinBus", RouterTransportImplementation.OpenFinTransport);

module.exports = RouterTransport;
