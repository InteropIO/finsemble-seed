/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
if (window.top === window) { // @todo - remove when OpenFin Fixes preload

	var Utils = require("../common/util");
	var Validate = require("../common/validate");
	var wrapCallbacks = require("../common/wrapCallbacks");

	// FSBL.initialize() or fin.desktop.main() may start first. It's unpredictable. initialize() depends on main()
	// so we use variables to defer running that function if main() hasn't yet run.
	var deferredInitialize = false;
	var deferredCallback = null;
	var mainHasRun = false;
	var started = false;
	var FSBL = function () {
		var self = this;
		var onlineClients = [];
		var clients = [];
		var status = "offline";
		var windowName = "";
		var startTimeoutValue;
		var startTimer;

		this.setWindowName = function (name) {
			console.log("settingWindowName");
			windowName = name;
		};

		this.Utils = Utils;
		this.Validate = Validate;
		this.Clients = {
			RouterClient: require("../clients/routerClientInstance"),
			StorageClient: require("../clients/storageClient"),
			LauncherClient: require("../clients/launcherClient"),
			DataStoreClient: require("../clients/dataStoreClient"),
			LinkerClient: require("../clients/linkerClient"),
			WindowClient: require("../clients/windowClient"),
			WorkspaceClient: require("../clients/workspaceClient"),
			DialogManager: require("../clients/dialogManagerClient"),
			AuthenticationClient: require("../clients/authenticationClient"),
			ConfigClient: require("../clients/configClient"),
			DataTransferClient: require("../clients/dataTransferClient"),
			Logger: require("../clients/logger"),
			BaseClient: require("../clients/baseClient")
		};

		function setStartupTimer() {
			startTimeoutValue = 10000;
			startTimer = setTimeout(startupTimeoutHandler, startTimeoutValue); // cleared in setServiceOnline
		}

		function startupTimeoutHandler() {
			console.error("STARTUP WARNING: FSBL not online after " + startTimeoutValue / 1000 + " seconds",
				"Clients Online", onlineClients, "All Clients", clients);
		}

		function setFSBLOnline() {
			console.log("STARTUP: FSBL ONLINE");
			clearTimeout(startTimer);
			status = "online";
		}

		this.getFSBLInfo = function (cb) {
			return new Promise(function (resolve, reject) {
				if (status === "online") {
					self.Clients.ConfigClient.get({ field: "finsemble" }, function (err, config) {
						let FSBLInfo = {
							FSBLVersion: config.FSBLVersion,
							gitHash: config.gitHash
						};
						if (cb) {
							cb(FSBLInfo);
						}
						resolve(FSBLInfo);
					});
				} else {
					reject("FSBL Not initialized");
				}
			});
		};

		this.addClient = function (name, obj) {
			if (!this.Clients[name]) {
				this.Clients[name] = obj;
			}
		};

		this.useClients = function (clientList) {
			for (var i = 0; i < clientList.length; i++) {
				if (this.Clients[clientList[i]] && clients.indexOf(clients[i]) === -1) {
					clients.push(clientList[i]);
				}
			}
		};

		this.useAllClients = function () {
			clients = [];
			for (var key in this.Clients) {
				if (clients.indexOf(key) === -1) {
					if (!this.Clients[key].initialize) { continue; }//hack for now
					clients.push(key);
				}
			}
		};

		this.isinitialized = false;
		this.initialize = function (cb) {

			setStartupTimer();

			this.Clients.Logger.start();
			if (!mainHasRun) {
				deferredInitialize = true;
				deferredCallback = cb;
				return;
			}

			if (this.isinitialized) {
				if (cb) {
					this.addEventListener("onReady", cb);
				}
				return;
			}
			this.isinitialized = true;

			console.log("IN THE FSBL ENTRY INITIALIZING", windowName);
			this.Clients.RouterClient.addListener(windowName + ".clientOnline", function (err, data) {
				if (err) { return console.error(err); }
				self.setClientOnline(data.data);
			});
			if (clients.length === 0) { return cb; }

			if (cb) {
				this.addEventListener("onReady", cb);
			}

			this.createClientStatusResponders();

			for (var i = 0; i < clients.length; i++) {
				this.Clients[clients[i]].windowName = windowName;
				this.Clients[clients[i]].initialize();
			}
			//workspaceService checks this to see if the window's initialized. If not, it closes the window during a workspace switch.

		};
		/**
		 * Creates status responders for all clients. This happens before all clients are initialized. This allows for clients to depend on other clients being initialized before they come online.
		 */
		this.createClientStatusResponders = function () {
			for (let i = 0; i < clients.length; i++) {
				let client = this.Clients[clients[i]];
				let clientResponderChannel = `${windowName}.${client.name}.status`;
				console.log(`Adding status responder for ${client.name}`);
				this.Clients.RouterClient.addResponder(clientResponderChannel, function (err, event) {
					if (err) {
						console.warn(err);
						return;
					}
					event.sendQueryResponse(null, client.status);
				});
			}
		};

		this.setClientOnline = function (clientName) {
			console.log("Client Online: " + clientName);
			Validate.args(clientName, "string");
			if (onlineClients.includes(clientName)) {
				return;
			}
			onlineClients.push(clientName);
			console.debug("test for online", onlineClients, clients);
			if (onlineClients.length === clients.length) {
				setFSBLOnline();

				this.isInitializing = false;
				if (this.listeners.onReady) {
					for (var i = 0; i < this.listeners.onReady.length; i++) {
						this.listeners.onReady[i]();
					}
					this.listeners.onReady = [];
				}
				if (!windowName) {
					alert("FAILURE: WindowName is null");
				}
				this.Clients.RouterClient.transmit(windowName + ".componentReady", { // signal workspace and launcher service that component is ready
					name: windowName
				});
			}
		};

		this.listeners = {};

		this.addEventListener = function (listenerType, callback) {
			Validate.args(listenerType, "string", callback, "function");

			if (!this.listeners[listenerType]) {
				this.listeners[listenerType] = [];
				if (status === "online" && listenerType === "onReady") {
					callback();
				}
				this.listeners[listenerType].push(callback);
			} else if (status === "online" && listenerType === "onReady") {
				callback();
			} else {
				this.listeners[listenerType].push(callback);
			}
		};

		this.onShutdown = function (cb) {
			this.addEventListener("onShutdown", cb);
		};
		/**
		 * When the application sends out a shutdown message, each service begins cleaning up. Part of the LauncherServices's cleanup is to make sure all components are allowed to cleanup. This method iterates through any registered cleanup methods. When all of them have finished (or 10 seconds elapses), it sends a response to the application saying that it's completed cleanup (`shutdownComplete`, below).
		 */
		this.handleShutdown = function (err, message) {
			var self = this;
			var numCallbacks = 0;
			var cleanupCompleted = 0;
			if (this.listeners.onShutdown) {
				this.Clients.RouterClient.transmit("LauncherService.shutdownResponse", {
					waitForMe: true,
					name: windowName
				});

				numCallbacks = this.listeners.onShutdown.length;
				for (let i = 0; i < this.listeners.onShutdown.length; i++) {

					let cleanup = Utils.castToPromise(this.listeners.onShutdown[i]);
					cleanup()
						.then(function () {
							cleanupCompleted++;
							console.log("Cleanups completed:" + cleanupCompleted);
							checkCompletion();
						});
				}
			} else {
				this.Clients.RouterClient.transmit("LauncherService.shutdownResponse", {
					waitForMe: false,
					name: windowName
				});
				checkCompletion();
			}
			function checkCompletion() {
				if (numCallbacks === cleanupCompleted) {
					self.shutdownComplete();
				}
			}
		};
		/**
		 * When the component has finished running through its cleanup routine, this method is invoked, and the window is closed.
		 */
		this.shutdownComplete = function () {
			console.log("Shutdown Complete");
			this.Clients.RouterClient.transmit("LauncherService.shutdownCompleted", {
				name: windowName
			});
			fin.desktop.Window.getCurrent().close(true);
		};
		/**
		 * Listens for the command to shutdown.
		 */
		this.listenForShutdown = function () {
			this.Clients.RouterClient.addListener("LauncherService.shutdownRequest", this.handleShutdown.bind(this));
		};
		/**
		 * Triggers the application shutdown sequence.
		 */
		this.shutdownApplication = function () {
			self.Clients.RouterClient.transmit("Application.shutdown");
		};
		/**
		 * Triggers the application restart sequence.
		 */
		this.restartApplication = function () {
			FSBL.Clients.RouterClient.transmit("Application.restart");
		};
		/**
		 * Invokes the onClose method of each client.
		 */
		this.windowClose = function () {
			for (var clientKey in self.Clients) {
				let client = self.Clients[clientKey];
				if (client.onClose) { client.onClose(); }
			}

		};
	};
	FSBL = new FSBL();
	fin.desktop.main(function () {

		// Wrap OF functions that have callbacks to insure all callbacks invoked;
		// since class/constructor, must wrap at prototype level (otherwise prototypes won't be picked up)
		wrapCallbacks(fin.desktop.Application.prototype);
		wrapCallbacks(fin.desktop.Window.prototype);
		wrapCallbacks(fin.desktop.System); // not a class so done pass in prototype

		// Capture error and log it; define here (as early as possible) to catch early errors
		window.addEventListener("error", function (errorObject) {
			FSBL.Clients.Logger.error(errorObject.message,
				"File: " + errorObject.filename,
				"Line: " + errorObject.lineno,
				"Column: " + errorObject.colno,
				"Error Stack: \n    " + errorObject.error.stack.substring(errorObject.error.stack.search("at ")) // strip off irrelevant part of stack
			);
			return false;
		});

		if (started) {
			return;
		}
		started = true;
		window.console.log("FIN.MAIN CALLED");
		FSBL.Clients.RouterClient.ready(function () {
			var finWindow = fin.desktop.Window.getCurrent();
			console.debug("FSBL router ready after load");
			window.addEventListener("unload", function (event) {
				started = false;
				FSBL.windowClose();
				FSBL.Clients.RouterClient.disconnectAll();
			});

			FSBL.listenForShutdown();
			window.addEventListener("beforeunload", FSBL.windowClose);
			finWindow.addEventListener("closed", FSBL.windowClose);

			var windowName = fin.desktop.Window.getCurrent().name;
			FSBL.setWindowName(windowName);
			FSBL.Clients.RouterClient.addResponder(windowName + ".heartbeat", function (err, message) {
				message.sendQueryResponse(null, true);
			});
			FSBL.Clients.RouterClient.transmit(windowName + ".onSpawned", {
				name: windowName
			});

			finWindow.getOptions((opts) => {
				if (opts &&
					opts.customData &&
					opts.customData.component &&
					opts.customData.component.neededClients) {
					FSBL.useClients(opts.customData.component.neededClients);
				} else {
					FSBL.useAllClients();
				}
				FSBL.initialize();
			});

			finWindow.addEventListener("closed", FSBL.windowClose);

			mainHasRun = true;
			if (deferredInitialize) {
				FSBL.initialize(deferredCallback);
			}
		});
	});

	module.exports = FSBL;
}
