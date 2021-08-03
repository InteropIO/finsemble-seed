/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

// This file contains the SharedWorker "thread" used to build the "SharedWorker"" router transport (see routerTransport.js), used
// by all router clients and the router service. It is typically at the center of Finsemble communications -- it provides the
// fastest communication between windows whenever the Openfin Bus transport isn't required for cross-domain communication.

// Event messsage between clients (i.e. Finsemble components and services) and the router service flow though here.
// Again, shared worker threads cannot communicate across domains or iFrames, so this is only for "local"" clients.

const portList = [];
let routerServicePort = null;
let ready = false;

// invoked each time a client connects to this shared worker thread

// Note: a global `onconnect` is how sharedWorkers work (there is no "window" object in a shared worker). We must disable eslint for the following line.

// eslint-disable-next-line no-undef
onconnect = function (event) {
	const port = event.ports[0];
	const portIndex = portList.push(port) - 1;

	// invoked for each each router message (both to router service and from router service)
	port.onmessage = function (routerMessage) {
		// Maintain the order of this conditional with the check for the "connect" first. Necessary in case router service connects to a pre-existing shared work whose state is already "ready".
		// We've seen this in the field because sharedWorker remains allocated across restarts; if this happen then must allow the second "connect" or router will fail
		if (routerMessage.data.data === "connect" && routerMessage.data.source === "RouterService") {
			routerServicePort = port;
			port.server = "true";
			ready = true;
		} else if (ready) {
			if (!port.server) {
				// if addressed to router
				routerServicePort.postMessage([portIndex, routerMessage.data[1]]);
			} else {
				// from router so contains destination port index with routerMessage
				portList[routerMessage.data[0].port].postMessage([portIndex, routerMessage.data[1]]);
			}
		} else {
			console.warn("Service not connected yet"); // console message won't be seen in shared worker, but use in case console is replace
		}
	};
};
