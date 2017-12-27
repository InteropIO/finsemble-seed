//replace with import when ready
//Forgive this; we will fix it in a future release.
let Finsemble = require("@chartiq/finsemble");
let baseService = Finsemble.baseService;
let RouterClient = Finsemble.Clients.RouterClient;
let LinkerClient = Finsemble.Clients.LinkerClient;
let LauncherClient = Finsemble.Clients.LauncherClient;
let Logger = Finsemble.Clients.Logger;
let WindowClient = Finsemble.Clients.WindowClient;
let DistributedStore = Finsemble.Clients.DistributedStoreClient;
let util = Finsemble.Util;
let console = new util.Console('RPC');
WindowClient.initialize();
LauncherClient.initialize();
DistributedStore.initialize();
LinkerClient.initialize();
Logger.start();

LinkerClient.publish = function (params) {
	let groups = params.groups;
	for (var i = 0; i < groups.length; i++) {
		var group = groups[i];
		this.routerClient.transmit(group + "." + params.dataType, { type: params.dataType, data: params.data });
		this.routerClient.transmit(group, { type: params.dataType, data: params.data });
	}
};

/**
 * The RPC Service receives calls from the RPCClient.
 * @constructor
 */
function RPCService() {
	var groups = {};
	var self = this;

	/**
	 * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
	 * @private
	 */
	this.createRPCEndpoints = function () {
		//For every function on the LinkerClient object, set up a channel on the IAB.
		for (let endpoint in LinkerClient) {
			//Channel for this API.
			let channel = `FSBL.Clients.LinkerClient.${endpoint}`;
			fin.desktop.InterApplicationBus.subscribe('*', null, channel, (message, uuid, name) => {
				//The window publishing must include an array of arguments, called args. It must also provide a callback channel.
				let { args, callbackChannel } = message;
				let uniqueID = uuid + name;
				//Validation
				if (!callbackChannel) {
					callbackChannel = channel;
				}
				if (!args) {
					Logger.system.warn(`No args passed into RPC endpoint, ${channel}`);
					args = [];
				}


				if (endpoint === 'addToGroup') {
					if (!groups[uniqueID]) {
						groups[uniqueID] = []
					}
					groups[uniqueID].push(args[0]);
					//2nd param is ClientName, which is optional.
					if (typeof (args[1]) === "undefined") {
						args[1] = "";
					}
				}
				if (endpoint === 'removeFromGroup') {
					let index = groups[uniqueID].indexOf(args[0]);
					groups[uniqueID].splice(index, 1);
					//2nd param is ClientName, which is optional.
					if (typeof (args[1]) === "undefined") {
						args[1] = "";
					}
				}
				if (endpoint === 'publish') {
					args[0].groups = groups[uniqueID];
				}

				//Since we can't execute a callback from java, c#, or whatever language, we create a new one here. When the LinkerClient API is done processing the request, we send the err and response back across the bus (on the callback channel defined earlier).
				let newCB = function () {
					//The linker was written to handle a single window.
					if (['subscribe', 'publish'].includes(endpoint)) {
						let response = arguments[1];
						if (!groups[uniqueID].includes(response.header.channel)) {
							return;
						}
					}
					console.log("Sending API Response", uuid, name, callbackChannel, arguments);
					fin.desktop.InterApplicationBus.send(uuid, name, callbackChannel, arguments);
				}
				//The last argument for all of our APIs is a callback. We push our new callback onto the array of arguments that they pass in.
				args.push(newCB);

				LinkerClient[endpoint].apply(LinkerClient, args);
			});
		}
	};

	return this;
}
RPCService.prototype = new baseService();
var serviceInstance = new RPCService('RPCService');
fin.desktop.main(function () {
	serviceInstance.onBaseServiceReady(function (callback) {
		console.log("baseServiceReady");

		Logger.system.log("onBaseServiceReady called");
		serviceInstance.createRPCEndpoints();
		callback();
	});
})
serviceInstance.start();

module.exports = serviceInstance;

