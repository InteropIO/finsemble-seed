var Utils = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator
var BaseClient = require("./baseClient");
var Logger = require("./logger");
Logger.system.log("Starting ChatClient");

/**
 *
 * Public API for The  chatServiceClient.
 * @constructor
 * @hideConstructor true
 * @private
 * @param {Object} params
 * @param {function} params.onReady A function to be called once the client is
 * @param {function} params.name The name of the service
 */
function ChatClient(params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	BaseClient.call(this, params);
	var clientType = "Slack";
	var authed = false;
	var listeners = {};
	var baseData = { users: [], ims: [], channels: {}, groups: {} };
	var rawData = null;
	var chatWindows = {};
	var closingChildren = false;
	var userList = {};
	this.setType = function (type) {
		clientType = type;
	};

	this.addListener = function (event, callback) {
		Validate.args(event, "string", callback, "function");
		if (listeners[event]) {
			return listeners[event].push(callback);
		}
		listeners[event] = [callback];
	};
	this.removeListener = function (event, callback) {
		Validate.args(event, "object", callback, "function");
		if (!listeners[event]) { return; }
		var functionLocation = listeners[event].indexOf(callback);
		if (functionLocation > -1) {
			listeners[event].splice(functionLocation, 1);
		}
	};
	this.listenForNewMessage = function (channelId) {
		this.routerClient.subscribe("chatService-" + clientType + "." + channelId + ".msg", newMessage);
	};

	this.launchChatWindows = function (cb) {
		Validate.args(cb, "function");
		FSBL.Clients.StorageClient.get({ topic: "finsemble", key: "chatWindows" }, function (err, response) {
			if (err) {
				return Logger.system.error(err);
			}
			if (!response) {
				return;
			}
			chatWindows = response;

			for (var key in chatWindows) {
				FSBL.Clients.LauncherClient.spawn("Chat", { options: chatWindows[key] }, function (err, spawnResponse) {
					Logger.system.log("errrr", err);
					if (!spawnResponse) { return; }
					function onSpawnClosed() {
						delete chatWindows[spawnResponse.customData.channelId];
						if (!closingChildren) {
							FSBL.Clients.StorageClient.save({ topic: "finsemble", key: "chatWindows", value: chatWindows }, function (err, response) {
								Logger.system.log("save....", err, response);
							});
						}
						spawnResponse.finWindow.removeListener("closed");
					}
					spawnResponse.finWindow.addEventListener("closed", onSpawnClosed);
				});
			}

			cb(err, response);
		});
	};
	this.getAuthed = function () {
		return authed;
	};
	this.getUrl = function (cb) {
		this.routerClient.query("chatService-" + clientType + ".url", {}, function (err, response) {
			Logger.system.log("chatService-url", err, response);
			if (cb) {
				cb(err, response.data);
			}
		});
	};
	this.getCurrentUser = function () {
		if (baseData && baseData.self) {
			return baseData.self;
		}
	};
	this.getChannelMessages = function (channelId, cb) {
		Validate.args(channelId, "object", cb, "function");

		this.routerClient.query("chatService-" + clientType + ".channelHistory", { channelId: channelId }, function (err, response) {
			Logger.system.log("chatService-", err, response);
			addUserNamesToDMs(response.data.messages);
			if (cb) {
				cb(err, response.data);
			}
		});
	};
	this.getDMMessages = function (channelId, cb) {
		Validate.args(channelId, "object", cb, "function");
		this.routerClient.query("chatService-" + clientType + ".dmHistory", { channelId: channelId }, function (err, response) {
			Logger.system.log("response--", response);
			addUserNamesToDMs(response.data.messages);
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	this.getGroupHistory = function (channelId, cb) {
		Validate.args(channelId, "object", cb, "function");

		this.routerClient.query("chatService-" + clientType + ".groupHistory", { channelId: channelId }, function (err, response) {
			addUserNamesToDMs(response.data.messages);
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	this.getUsers = function () {
		return baseData.users;
	};

	this.getChannels = function () {
		return baseData.channels;
	};
	this.getDirectMessages = function () {
		return baseData.ims;
	};
	this.getGroups = function () {
		return baseData.groups;
	};
	this.openChatWindow = function (dm, type) {
		Validate.args(dm, "object", type, "string");

		var self = this;

		if (!chatWindows[dm.id]) {
			chatWindows[dm.id] = {};
			FSBL.Clients.LauncherClient.spawn("Chat", {
				options: {
					customData: {
						windowType: "chatWindow",
						channelId: dm.id,
						channelName: dm.name,
						type: type,
						persists: false
					}
				}
			}, function (err, response) {
				if (err) {
					Logger.system.error(err);
				}
				chatWindows[dm.id] = response.data;
				FSBL.Clients.StorageClient.save({ topic: "finsemble", key: "chatWindows", value: chatWindows }, function (err, response) {
					Logger.system.log("save....", err, response);
				});
				var win = fin.desktop.Window.wrap(response.uuid, response.name);
				win.addEventListener("closed", function () {
					Logger.system.log("closed called");
					delete chatWindows[dm.id];
				});
			});

		} else {
			var win = fin.desktop.Window.wrap(chatWindows[dm.id].uuid, chatWindows[dm.id].name);
			win.bringToFront();
		}
	};
	this.closeChildren = function () {
		closingChildren = true;
		//for (var child in chatWindows) {
		//Logger.system.log("chatWindows[child].name", chatWindows[child].name);
		//fin.desktop.Window.wrap(fin.desktop.Application.getCurrent().uuid, chatWindows[child].name).close();
		//}
	};
	this.sendMessage = function (msg, channelId) {
		Validate.args(msg, "string", channelId, "object");
		this.routerClient.transmit("chatService-" + clientType + "-sendMsg", { text: msg, channelId: channelId });
	};
	this.markChannel = function (type, channelId) {
		Validate.args(type, "string", channelId, "object");
		this.routerClient.transmit("chatService-" + clientType + "-markChannel", { type: type, channelId: channelId });
	};

	function addUserNamesToDMs(msgList) {
		Validate.args(msgList, "array");
		Logger.system.log("msgList", msgList);
		var users = baseData.users;
		for (var i = 0; i < msgList.length; i++) {
			var message = msgList[i];
			message.name = userList[message.user];
		}
	}
	function updateChannels(err, data) {
		Validate.args(err, "object", data, "object");
		baseData.channels = data.data;
		processEvent("channels", baseData.channels);
	}
	function updateGroups(err, data) {
		Validate.args(err, "object", data, "object");
		baseData.groups = data.data;
		processEvent("groups", baseData.groups);
	}
	function updateIms(err, data) {
		Validate.args(err, "object", data, "object");
		baseData.ims = data.data;
		processEvent("ims", baseData.ims);
	}
	function updateUsers(err, data) {
		Validate.args(err, "object", data, "object");
		Logger.system.log("updateUsers", err, data);
		processEvent("users", data);
	}
	function newMessage(err, data) {
		Validate.args(err, "object", data, "object");
		//data.data.name = data.data.user;
		if (!data.data.channel) { return; }
		processEvent("newMessage", data.data);
	}
	function loaded(err, data) {
		Validate.args(err, "object", data, "object");
		if (!data.data) { return; }

		baseData = data.data;
		Logger.system.log("loaded", baseData);
		if (!baseData.self || !baseData.self.id) { return; }
		//parseDirectMessages();
		//parseChannels();
		processAllEvent();
		parseUsers();
	}

	function parseUsers() {
		var users = baseData.users;
		for (var i = 0; i < users.length; i++) {
			userList[users[i].id] = users[i].name;
		}
	}
	function dmMarked(data) {
		if (!data) { return; }
		var markedRecord = data.data;
		for (var i = 0; i < baseData.ims.length; i++) {
			var dm = baseData.ims[i];
			if (markedRecord.channel === dm.id) {
				dm["unread_count"] = 0;
				break;
			}
		}
		processEvent("directMessages", data);
	}
	function groupMarked(data) {
		Validate.args(data, "object");
		if (!data) { return; }
		var markedRecord = data.data;
		for (var i = 0; i < baseData.channels.length; i++) {
			var channel = baseData.channels[i];
			if (markedRecord.channel === channel.channel) {
				channel["unread_count"] = 0;
				break;
			}
		}
		processEvent("channels", data);
	}
	function authedChanged(err, data) {
		Validate.args(err, "object", data, "object");
		Logger.system.log("authed", err, data);
		authed = data.data.authed;
		processEvent("auth", data);
	}
	function processEvent(event, data) {
		Validate.args(event, "string", data, "object");
		Logger.system.log("event", listeners, event);
		if (!listeners[event]) { return; }
		for (var i = 0; i < listeners[event].length; i++) {
			listeners[event][i](data);
		}
	}
	function processAllEvent() {
		for (var event in listeners) {
			for (var i = 0; i < listeners[event].length; i++) {
				listeners[event][i]();
			}
		}
	}

	this.setupChannels = function () {
		for (var i = 0; i < baseData.channels.length; i++) {
			var channel = baseData.channels[i];
			this.routerClient.subscribe("chatService-" + clientType + "." + channel.id + ".msg", newMessage);
		}
	};

	this.setupGroups = function () {
		var groups = baseData.groups;
		for (var i = 0; i < baseData.groups.length; i++) {
			var group = baseData.groups[i];
			this.routerClient.subscribe("chatService-" + clientType + "." + group.id + ".msg", newMessage);
		}

	};
	this.setupDMs = function () {
		for (var i = 0; i < baseData.ims.length; i++) {
			var dm = baseData.ims[i];
			this.routerClient.subscribe("chatService-" + clientType + "." + dm.id + ".msg", newMessage);
		}
	};

	this.setupPubSub = function () {
		Logger.system.log("client--", clientType);
		this.routerClient.subscribe("chatService-" + clientType + "-channels", updateChannels);
		this.routerClient.subscribe("chatService-" + clientType + "-groups", updateGroups);
		this.routerClient.subscribe("chatService-" + clientType + "-ims", updateIms);
		//this.routerClient.subscribe("chatService-msg", newMessage);
		this.routerClient.subscribe("chatService-" + clientType + "-users", updateUsers);
		this.routerClient.subscribe("chatService-" + clientType + "-loaded", loaded);
		this.routerClient.subscribe("chatService-" + clientType + "-authed", authedChanged);
		this.routerClient.subscribe("chatService-" + clientType + "-dmMarked", dmMarked);
		this.routerClient.subscribe("chatService-" + clientType + "-groupMarked", groupMarked);

	};


	function parseDirectMessages() {

		var currentUser = baseData.self.id;
		for (var i = 0; i < baseData.ims.length; i++) {
			var im = baseData.ims[i];
			for (var j = 0; j < baseData.users.length; j++) {
				var user = baseData.users[j];
				if (user.id === im.user) {
					if (im.latest && im.latest.user === currentUser) {
						im.latest.self = true;
					}
					im.name = user.name;
					break;
				}
			}
		}
	}
	function parseChannels() {
		var currentUser = baseData.self.id;
		for (var i = 0; i < baseData.channels.length; i++) {
			var channel = baseData.channels[i];
			if (channel.latest && channel.latest.user === currentUser) {
				channel.latest.self = true;
			}
		}
	}

}


var chatClient = new ChatClient({
	onReady: function (cb) {
		//left in for backwards compatibility.
		chatClient.setupPubSub();
		Logger.system.log("chatClient online");
		if (cb) {
			cb();
		}
	},
	name: "chatClient"
});

chatClient.requiredServices = ["chatService"];
//chatClient.initialize();
Logger.system.log("chat started");
module.exports = chatClient;