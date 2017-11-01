/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Validate = require("../common/validate"); // Finsemble args validator
var RouterClient = require("routerClientInstance");
var WorkspaceClient = require("workspaceClient");
var Logger = require("./logger");

Logger.system.log("Starting HumanInterfaceClient");

module.exports = {
	/**
	*
	* @introduction
	* @hideConstructor true
	* <h2>Human Interface Client</h2>
	* Client interface to a "global" intercept service for keystrokes, gestures, clicks across any and all component windows. If a handler is provided, handler will be called when the event occurs.
	* Otherwise, the event will bubble up to the router and be broadcast on the HUI channel.

	* @param  {Object} params Input parameters
	* @param  {String} params.eventType Type of Event; blur, focus, keyup, keydown, etc.
	* @param  {Object=} params.container
	* @param  {Function=} params.handler Event handler. If empty, event will be transmitted by the FSBL Bus on the app channel.
	*
	* @namespace HumanInterfaceClient
	* @shouldBePublished false
	* @example HumanInterfaceClient.intercept({type:'keypress', container:container, handler:function(e){Logger.system.log('handled!')}});
	*/
	HumanInterfaceClient: function (params) {
		Validate.args(params, "object", cb, "function=") &&
		Validate.args2("params.eventType", params.eventType, "string", "params.container", params.container, "object=", "params.handler", params.handler, "function=");
		var defaultHandler = function (e) {
			RouterClient.transmit({ subject: "Intercepts", channel: "app", message: e });
		};
		var eventType = params.eventType,
			eventHandler = params.handler ? params.handler : defaultHandler,
			eventContainer = params.container,
			container = {};

		if (params.container) {
			if (params.container instanceof HTMLElement) {
				container = params.container;
			} else {
				container = WorkspaceClient.getContainer(params.container);
			}
		} else {
			container = window;
		}
		container.addEventListener(eventType, eventHandler);
	}
};