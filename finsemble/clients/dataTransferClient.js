/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var Utils = require("../common/util");
var Logger = require("./logger");
var Validate = require("../common/validate"); // Finsemble args validator
var BaseClient = require("./baseClient");
var configClient = require("./configClient");
var linkerClient = require("./linkerClient");
var launcherClient = require("./launcherClient");
var windowClient = require("./windowClient");
var async = require("async");
const DRAG_START_CHANNEL = "DataTransferClient.dragStart";
const DRAG_END_CHANNEL = "DataTransferClient.dragEnd";
const SHARE_HIGHLIGHT_OPACITY = 1;
const SHARE_METHOD = {
	DROP: "drop",
	SPAWN: "spawn",
	LINKER: "linker"
};

/**
 *
 * @introduction
 * <h2>DataTransfer Client (Beta)</h2>
 *
 * The DataTransfer client acts as an API to share data between components via a user action such as drag and drop. As an example consider a user wanting to share a chart inside a chat. The DataTransfer Client can also make use of the Linker Client to share data between linked windows.
 *
 * A component that shares data needs to publish the data types it can share by calling setEmitters. The Finsemble Window Manager automatically adds a draggable share icon to any component that calls setEmitters.
 *
 * Similarly a component that can receive data needs to publish that using addReceivers. Since it is possible to have multiple components on a page receiving the data, you can add multiple receivers for the same dataType.
 *
 * The DataTransfer client overlays a scrim on windows once you start dragging a Finsemble Sharable item and on the windows that can receive data the scrim behaves as a drop zone. However, this doesn't always work well, especially with complex third party components. You may need to add your own drop zone to the document and use FSBL.DataTransferClient.drop as the handler.
 *
 * Here is a [tutorial on using the DataTransfer Client](tutorial-sharingData.html).
 *
 * @hideConstructor true
 * @constructor
 */
var DataTransferClient = function (params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	BaseClient.call(this, params);
	this.emitters = {};
	this.receivers = {};
	this.receiveResponder = false;
	this.linkerListener = false;
	var self = this;

	/**
	 * Default: true
	 *
	 * Set this to false to disable handling of linked data
	 */
	this.openLinkerDataByDefault = true;

	/**
	 * This constant object contains all the share methods. You can use it in a receive handler to handle different share methods. Current share methods are
	 *	* SHARE_METHOD.DROP
	 *	* SHARE_METHOD.SPAWN
	 *	* SHARE_METHOD.LINKER
	 *
	 * @example
	 * // Ignore data unless it was dropped
	 * function shareHandler(err, response) {
	 *	if(response.shareMethod != FSBL.Clients.DataTransferClient.SHARE_METHOD.DROP) {
	 *		return;
	 * 	}
	 *	// Handle dropped data below:
	 * }
	 */
	this.SHARE_METHOD = SHARE_METHOD;

	/**
	 * setEmitters sets all the data that can be shared by the component.
	 *
	 * @param {object} params.emitters This is a list of objects which contain a dataType and a function to get the data.
	 * @example
	 * DataTransferClient.setEmitters({
	 * 	emitters: [
	 * 		{
	 * 			type: "symbol",
	 * 			data: getSymbol
	 * 		},
	 * 		{
	 * 			type: "chartiq.chart",
	 * 			data: getChart
	 *		}
	 * 	]
	 * })
	 */
	this.setEmitters = function (params) {

		if (!Array.isArray(params.emitters)) { return; }
		params.emitters.forEach(function (emitter) {
			//TODO validate
			self.emitters[emitter.type] = emitter;
		});

		//Object.assign(this.emitters, params.emitters);
		this.routerClient.publish(this.windowName + "Finsemble.Sharer", {
			emitterEnabled: Object.keys(self.emitters).length ? true : false,
			receiverEnabled: Object.keys(self.receivers).length ? true : false,
		});
		if (!this.receiveResponder) {
			Logger.system.log("Adding DataTransfer Responder");
			this.routerClient.addResponder(this.windowName + ".Share", function (err, response) {
				self.emit.call(self, err, response);
			});
			this.receiveResponder = true;
		}
	};

	/**
	 * addReceivers adds receivers for the data that can be received by the component.
	 *
	 * @param {object} params.receivers This is a list of objects, each containing a type and a handler function to call with the data once received. The receiver can take a regular expression as its type to provide the ability to receive multiple data types. Each type can have multiple handlers so you can use the same type multiple times in your call.
	 *
	 * @example
	 * DataTransferClient.addReceivers({
	 * 	receivers: [
	 * 		{
	 * 			type: "symbol",
	 * 		 	handler: changeSymbol
	 * 		}, {
	 * 			type: "chartiq.chart",
	 * 			handler: openChart
	 * 		}
	 * 	])
	 * DataTransferClient.addReceivers({
	 * 	receivers: [
	 *		{
	 * 			type: &#47;.*&#47;,
	 *	 		handler: getEverythingAComponentCanEmit
	 * 		}
	 * 	])
	 */

	this.addReceivers = function (params) {
		if (!Array.isArray(params.receivers)) { return; }

		params.receivers.forEach(function (receiver) {
			//TODO validate
			var type = receiver.type.toString(); // in case this is a regex
			if (!self.receivers[type]) { self.receivers[type] = [receiver]; }
			else { self.receivers[type].push(receiver); } //TODO check dupes??

		});

		//Object.assign(this.receivers, params.receivers);
		this.routerClient.publish(this.windowName + "Finsemble.Sharer", {
			emitterEnabled: Object.keys(self.emitters).length ? true : false,
			receiverEnabled: Object.keys(self.receivers).length ? true : false,
		});

		var spawnData = windowClient.getSpawnData();
		if (spawnData && spawnData.sharedData) {
			windowClient.getComponentState({ field: "Finsemble.DealtWithSpawnSharedData" }, function (err, data) {
				if (!data) {
					windowClient.setComponentState({ field: "Finsemble.DealtWithSpawnSharedData", value: "done" }, function () {
						Logger.system.log("Spawn");
						dataTransferClient.handleSharedData(spawnData.sharedData, SHARE_METHOD.SPAWN);
					});
				}
			});
		}

		if (!this.linkerListener && this.openLinkerDataByDefault) {
			linkerClient.subscribe("Finsemble.DataTransferClient", function (data, responseDetail) {
				if (!responseDetail.originatedHere()) {
					Object.keys(data).forEach(function (dataType) {
						if (self.canReceiveData(dataType)) {
							var dataToHandle = {};
							dataToHandle[dataType] = data[dataType];
							dataTransferClient.handleSharedData(dataToHandle, SHARE_METHOD.LINKER);
						}
					});

				}
			});
			this.linkerListener = true;
		}


	};


	/**
	 * updateReceivers updates the handlers for the data that can be received by the component.
	 *
	 * @param {object} params.receivers This is a list of objects, each containing a type, the existing handler (oldHandler) and a handler function to replace the old handler with.
	 * @private
	 * @example
	 * DataTransferClient.updateReceivers({
	 * 	receivers: [
	 * 		{
	 * 			type: "symbol",
	 *			oldHandler: updateSymbol,
	 * 		 	handler: changeSymbol
	 * 		}, {
	 * 			type: "chartiq.chart",
	 *			oldHandler: openChart_old,
	 * 			handler: openChart_new
	 * 		}
	 * 	])
	 * DataTransferClient.updateReceivers({
	 * 	receivers: [
	 *		{
	 * 			type: /.*&#47;,
	 *	 		oldHandler: getEverythingAComponentCanEmit,
	 *			handler: doSomethingWithAllThisData
	 * 		}
	 * 	])
	 */
	this.updateReceivers = function (params) {
		if (!Array.isArray(params.receivers)) { return; }

		params.receivers.forEach(function (receiver) {
			//TODO validate
			var type = receiver.type.toString();
			if (!self.receivers[type]) { self.receivers[type] = []; }
			var receivers = self.receivers[type];

			for (var i = 0; i < receivers.length; i++) {
				if (receivers[i].handler === receiver.oldHandler) {
					receivers[i].handler = receiver.handler;
				}
			}

			self.receivers[type].push(receiver.handler);
		});

		if (!self.linkerListener) {
			linkerClient.subscribe("Finsemble.DataTransferClient", function (data, responseDetail) {
				if (!responseDetail.originatedHere()) { dataTransferClient.handleSharedData(data, SHARE_METHOD.LINKER); }
			});
			self.linkerListener = true;
		}

		//TODO - should you add if handler does no exist?
		//Object.assign(self.receivers, params.receivers);
		//self.routerClient.publish(self.windowName + 'Finsemble.Sharer', { receiverEnabled: true });
	};

	/**
	 * removeReceivers removes the handlers for the data that can be received by the component.
	 *
	 * @param {object} params.receivers This is a list of objects, each containing a type and the handler that needs to be removed.
	 * @private
	 * @example
	 * DataTransferClient.removeReceivers({
	 * 	receivers: [
	 * 		{
	 * 			type: "symbol",
	 * 		 	handler: changeSymbol
	 * 		}, {
	 * 			type: "chartiq.chart",
	 * 			handler: openChart
	 * 		}
	 * 	])
	 * DataTransferClient.removeReceivers({
	 * 	receivers: [
	 *		{
	 * 			type: /.*&#47;,
	 *	 		oldHandler: getEverythingAComponentCanEmit
	 * 		}
	 * 	])
	 */
	this.removeReceivers = function (params) {
		if (!Array.isArray(params.receivers)) { return; }

		params.receivers.forEach(function (receiver) {
			//TODO validate
			var type = receiver.type.toString();
			if (!self.receivers[type]) { return; }
			var receivers = self.receivers[type];

			for (var i = 0; i < receivers.length; i++) {
				if (receivers[i].handler === receiver.handler) {
					receivers.splice(i, 1);
					break;
				}
			}
		});

		// TODO - remove drop zone if no receivers
		//Object.assign(self.receivers, params.receivers);
		//self.routerClient.publish(self.windowName + 'Finsemble.Sharer', { receiverEnabled: true });
	};


	/**
	 * This is a drag event handler for an element that can be dragged to share the data. The window manager uses this internally when the share icon is dragged. This can be attached to any element that needs to be draggable.
	 *
	 * @param {event} event
	 */
	this.dragStart = function (event) {
		self.routerClient.transmit(DRAG_START_CHANNEL, Object.keys(self.emitters));
		var data = {
			FSBL: true,
			window: self.windowName,
			emitters: Object.keys(self.emitters)
		};
		Logger.system.log("Drag Data:", data);
		event.dataTransfer.setData("text/plain", JSON.stringify(data));
	};

	this.dragStartWithData = function (event, data) {
		self.routerClient.transmit(DRAG_START_CHANNEL, Object.keys(data));
		var dragdata = {
			FSBL: true,
			containsData: true,
			window: self.windowName,
			data: data
		};
		Logger.system.log("Drag Data:", dragdata);
		event.dataTransfer.setData("text/plain", JSON.stringify(dragdata));
	};

	this.handleSharedData = function (sharedData, shareMethod) {
		Object.keys(self.receivers).forEach(function (key) {
			var receiver = self.receivers[key];
			var data = {};
			Logger.system.log("Receiver: ", key);
			Object.keys(sharedData).forEach(function (value) {
				Logger.system.log("Data Key: ", value);
				if (receiver[0].type instanceof RegExp) {
					if (value.match(receiver.type)) {
						data[value] = sharedData[value];
						Logger.system.log("Match RegEx");
					}
				} else if (self.receivers[value]) {
					data[value] = sharedData[value];
					Logger.system.log("Match");
				}
			});
			if (Object.keys(data).length) {
				receiver.forEach(function (r) { // Each receiver can have multiple entries
					r.handler(null, { data: data, shareMethod: shareMethod });
				});
			}
		});



	};

	/**
	 * This is a drop event handler that can be attached to any element that you want to be a drop zone for the DataTransfer Client. It automatically requests data for all the data elements that are common between the receiver and the emitter.
	 *
	 * @param {event} event
	 */
	this.drop = function (event) {
		if (!event.dataTransfer) { event.dataTransfer = event.originalEvent.dataTransfer; } // deal with jQuery events not having dataTransfer
		var data = event.dataTransfer.getData("text/plain");
		Logger.system.log(data);

		if (data) {
			try {
				var data = JSON.parse(data);
			} catch (e) {
				return;
			}
			if (data.FSBL) {
				event.preventDefault();
				event.stopPropagation();
				if (data.containsData) { //the data is embedded into the request
					self.handleSharedData(data.data, SHARE_METHOD.DROP);
				} else {
					var sourceWindow = data.window;
					var availableEmitters = data.emitters;

					var commonData = [];
					var receiverKeys = Object.keys(self.receivers);
					for (var i = 0; i < availableEmitters.length; i++) {
						var addToCommon = false;
						var emitter = availableEmitters[i];
						if (self.canReceiveData(emitter)) {
							commonData.push(emitter);
						}
					}

					Logger.system.log("Common Data", commonData);

					self.routerClient.query(sourceWindow + ".Share", commonData, function (err, response) {
						self.handleSharedData(response.data, SHARE_METHOD.DROP);
					});
				}
			}

		}
	};

	/**
	 *
	 *
	 * @param {object} params This is a list of strands whose data is required
	 * @param {function} cb This is the function to call with the data
	 * @private
	 */
	this.emit = function (error, params) {
		values = {};

		//TODO aync functions and test this stuff
		async.each(params.data, function (index, cb) {
			let item = self.emitters[index];
			if (item.data && typeof item.data === "function") {
				/*item(function (err, data) {
					if (err) {
						cb(err);
					} else {
						values[index] = data;
						cb();
					}
				})*/
				values[index] = item.data();
				cb();
			} else {
				values[index] = item.data;
				cb();
			}

		}, function () {
			params.sendQueryResponse(null, values);
		});
	};

	/**
	 * This gets a list of components that can receive a specific type. It looks in the config for each componentType for an advertiseReceivers property.
	 *
	 * @example
	 * "Advanced Chart": {
	 *		...
	 * 		"component": {
	 * 			"advertiseReceivers": ["chartiq.chart", "symbol"]
	 * 		},
	 *		...
	 *
	 *
	 * @param {object} params
	 * @param {string} [params.type]
	 * @param {Function=} cb callback to be invoked with the list of component types
	 *
	 * @example
	 * DataTransferClient.getComponentsThatCanReceiveType ({ type: "chartiq.chart"}, callback)
	 *
	 */
	this.getComponentsThatCanReceiveType = function (params, cb) {
		FSBL.Clients.ConfigClient.get({ field: "finsemble.components" }, function (err, response) {
			if (err) {
				cb(err, null);
			} else {
				var componentList = [];
				Object.keys(response).forEach(function (key) {
					if (!response[key] || !response[key].component) { return; }
					let advertiseReceivers = response[key].component.advertiseReceivers;
					if (!advertiseReceivers) {
						return;
					}
					if (!Array.isArray(advertiseReceivers)) {
						advertiseReceivers = [advertiseReceivers];
					}
					if (self.canReceiveData(params.type, advertiseReceivers)) {
						componentList.push(key);
					}
				});
				cb(null, componentList);
			}
		});
	};

	/**
	 * This will either open a component with the shared data or publish the shared data using the linker client if the window is linked
	 *
	 * @param {object} params
	 * @param {object} [params.data]
	 * @param {object} [params.publishOnly] if the component is linked, this will only publish the data, not force open a window if it does not exist
	 *
	 */
	this.openSharedData = function (params) {
		let componentListByType = {};
		let combinedComponentList = [];
		let data = params.data;

		let gotComponents = function (err, type, componentList) {
			componentListByType[type] = componentList;
			if (!componentList) { componentList = []; }
			componentList.forEach(function (component) {
				if (!combinedComponentList.includes(component)) {
					combinedComponentList.push(component);
				}
			});

			/* TODO - deal with specific cases:
				- multiple component types can consume same data
				- multiple data types - each to different component(s)
				- linker groups - different groups might have windows with different data
				- can there be other cases??

			*/

			/* TODO: restrict published data to specfic channels?
			*/

			// if we have everything
			if (Object.keys(data).length == Object.keys(componentListByType).length) {
				if (!combinedComponentList.length) {
					Logger.system.error("No Components Available to Handle the data");
				} else if (combinedComponentList.length == 1) {
					var groups = linkerClient.getGroups().groups;
					if (groups.length) {
						var windowsThatCanTakeData = [];
						async.each(groups, function (group, cb) {
							linkerClient.getAllWindowsInGroup(group.name, function (err, windows) {
								if (!Object.keys(windows).length) {
									cb();
									return;
								}
								Object.keys(windows).forEach(function (index) {
									let window = windows[index];
									if (window.componentType == combinedComponentList[0]) {
										windowsThatCanTakeData.push(window);
									}
								});
								cb();

							});
						}, function () {
							if (windowsThatCanTakeData.length || params.publishOnly) {
								linkerClient.publish({
									dataType: "Finsemble.DataTransferClient",
									data: data
								});
							} else {
								launcherClient.spawn(combinedComponentList[0], {
									data: {
										sharedData: data,
										linker: {
											groups: Object.keys(linkerClient.groups)
										}
									}
								});
							}
						});

						// TODO - check if linked windows exist
					} else {
						launcherClient.spawn(combinedComponentList[0], {
							data: {
								sharedData: data
							}
						});
					}
				} else {
					//TODO: Deal with multiple components
				}
			}

		};

		Object.keys(data).forEach(function (key) {
			let myKey = key;
			self.getComponentsThatCanReceiveType({ type: myKey }, function (err, componentList) {
				gotComponents(err, myKey, componentList);
			});
		});
	};

	/**
	 * @private
	 */
	this.addWindowHighlight = function (canReceiveData) {
		let scrim = document.createElement("div");
		scrim.id = "fsbl-share-scrim";
		scrim.className = "fsbl-share-scrim";
		let icon = document.createElement("i");
		if (canReceiveData) {
			icon.className = "ff-share yes";
			// use capture to make sure this happens
			document.addEventListener("dragover", self.dragover);
			document.addEventListener("drop", self.drop);
			Logger.system.info("Event Listeners Added");
		} else {
			icon.className = "ff-delete-circle no";
		}
		scrim.appendChild(icon);
		document.body.appendChild(scrim);


		fin.desktop.Window.getCurrent().updateOptions({
			opacity: SHARE_HIGHLIGHT_OPACITY
		});
	};

	/**
	 * @private
	 */
	this.removeWindowHighlight = function () {
		var scrim = document.getElementById("fsbl-share-scrim");
		if (scrim) { scrim.parentNode.removeChild(scrim); }
		document.removeEventListener("dragover", self.dragover);
		document.removeEventListener("drop", self.drop);
		fin.desktop.Window.getCurrent().updateOptions({
			opacity: 1
		});
	};

	/**
	 * @private
	 */
	this.canReceiveData = function (dataTypeArray, receiverKeys) {
		if (!Array.isArray(dataTypeArray)) {
			dataTypeArray = [dataTypeArray];
		}

		let local = false;

		if (!receiverKeys) {
			receiverKeys = Object.keys(self.receivers);
			local = true;
		}

		for (var i = 0; i < dataTypeArray.length; i++) {
			var emitter = dataTypeArray[i];
			for (var j = 0; j < receiverKeys.length; j++) {
				if (!local) { // this is if a string of data types is provided - used in getComponentsThatCanReceiveType
					if (emitter === receiverKeys[j]) {
						return true;
					}
					continue;
				}
				var receiver = self.receivers[receiverKeys[j]];
				if (!receiver.length) { continue; }
				else { receiver = receiver[0]; }
				if (receiver.type instanceof RegExp) { // Is it a regex?
					if (emitter.match(receiver.type)) {
						return true;
					}
				} else {
					if (emitter === receiver.type) {
						return true;
					}
				}
			}
		}
		return false;
	};

	/**
	 * @private
	 */
	this.dragover = function (e) {
		e.preventDefault();
		return false;
	};

	/**
	 * @private
	 */
	this.addListeners = function () {
		window.addEventListener("dragend", function () {
			self.routerClient.transmit(DRAG_END_CHANNEL, {});
		});

		this.routerClient.addListener(DRAG_START_CHANNEL, function (err, message) {
			let dataBeingShared = message.data;
			if (!self.canReceiveData(dataBeingShared) || message.originatedHere()) {
				self.addWindowHighlight(false);
			} else {
				self.addWindowHighlight(true);
			}
		});

		this.routerClient.addListener(DRAG_END_CHANNEL, function (err, message) {
			self.removeWindowHighlight();
		});
	};
};

var dataTransferClient = new DataTransferClient({
	onReady: function (cb) {
		dataTransferClient.addListeners();

		if (cb) {
			cb();
		}
	},
	name: "dataTransferClient"
});

dataTransferClient.requiredClients = ["configClient", "linkerClient", "launcherClient", "windowClient"];

module.exports = dataTransferClient;