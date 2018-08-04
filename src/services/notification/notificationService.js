const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const Logger = Finsemble.Clients.Logger;
const LauncherClient = Finsemble.Clients.LauncherClient;
const ConfigClient = Finsemble.Clients.ConfigClient;
Logger.start();
Logger.log("notification Service starting up");
LauncherClient.initialize();
ConfigClient.initialize();

const FILTER_TYPES = ["displayed","dismissed","all"];

const DEFAULT_NOTIFICATION_HEIGHT = 85;
const DEFAULT_NOTIFICATION_GAP = 5;
const DEFAULT_NOTIFICATION_WIDTH = 350;
const DEFAULT_NOTIFICATION_HISTORY_LENGTH = 250;
const DEFAULT_MAX_NOTIFICATIONS_TO_SHOW = 5;

const COUNTS_PUBSUB_TOPIC = "notification counts";
const API_QUERY_RESPONDER_TOPIC = "notification functions";
const UPDATES_ROUTER_TOPIC = "notification update";

const WINDOWS_TASKBAR_HEIGHT = 45;

/**
 * 
 * @constructor
 */
function notificationService() {
	const self = this;
	const notificationsDisplayed = [];
	const notificationsHistory = [];
	let historyIndex = 0;
	let idToNotification = {};

	//TODO: allow override of defaults via config/user preferences alongside default notification URL
	let notificationHeight = DEFAULT_NOTIFICATION_HEIGHT;
	let notificationGap = DEFAULT_NOTIFICATION_GAP;
	let notificationWidth = DEFAULT_NOTIFICATION_WIDTH;
	let maxNotificationsToRemember = DEFAULT_NOTIFICATION_HISTORY_LENGTH;
	let maxNotificationsToShow = DEFAULT_MAX_NOTIFICATIONS_TO_SHOW;
	//TODO: add a user preference setting and default for which monitor to show notifications on

	const alertOnceSinceStartUp = {};
	const alertCurrentCount = {};
	let defaultIconURL = null;

	
	//------------------------------------------------------
	//Util functions

	/** 
	 * Copied from ConfigUtil
	 * const ConfigUtil = require("../common/configUtil");
	 * 
	 * @private
	 */
	const getDefault = function (base, path, defaultValue) {
		var result = defaultValue;
		if (base) {
			try {
				let properties = path.split(".");
				let currentValue = base;
				for (let i = 1; i < properties.length; i++) {
					currentValue = currentValue[properties[i]];
				}
				result = currentValue;
			} catch (err) {
				result = defaultValue;
			}

			if (typeof(result) === "undefined") result = defaultValue;
		}
		return result;
	};	

	/**
	 * Gets the default template URL from the manifest at finsemble->notificationURL. If that doesn't exist then it falls back to the system template location.
	 * @private
	 */
	this.getDefaultIconURL = function (cb) {
		if (defaultIconURL) {
			setTimeout(function () {
				cb(defaultIconURL);
			}, 0);
		} else {
			ConfigClient.get({ field: "finsemble" }, function (err, finConfig) {
				defaultIconURL = getDefault(finConfig, "finsemble.systemTrayIcon", finConfig.applicationRoot + "/assets/img/Finsemble_Taskbar_Icon.png");
				cb(defaultIconURL);
			});
		}	
	};

	/**
	 * (Pseudo) GUID generator for notification IDs
	 * @private
	 */
	this.guid = function() {
		function s4() {
		  return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return s4() + s4() + '-' + s4();// + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}

	
	//------------------------------------------------------

	/**
	 * Conditionally alerts the end user using a desktop notification.
	 *
	 * @param {string} topic specifies a category for the notification. Any topic string can be specified; however "system" is the recommended topic for system notifications applicable both to end uses and to developers. "dev" is the recommended topic for notifications applicable only during development (e.g. a notification that config.json has an illegal value).
	 * @param {string} frequency Either "ALWAYS", "ONCE-SINCE-STARTUP", or "MAX-COUNT" to determine if alert should be displayed. Note, the frequencies are based on the number of notifications emitted from a window (as opposed to system wide.)
	 * @param {string} identifier uniquely identifies this specific notification message. Used when "frequency" is set to "ONCE-SINCE-STARTUP" or "MAX-COUNT"
	 * @param {string} message Notification message content
	 * @param {object=} params
	 * @param {number} params.iconURL URL for the icon iuamge to display on the notification
	 * @param {number} params.maxCount specifies the max number of notifications to display for specified identifier when frequency="MAX-COUNT" (default is 1)
	 * @param {number} params.duration time in milliseconds before auto-dismissing the notification (defaults to 24 hours)
	 * @param {object} params.templateOptions Any additional options that should be passed to the template for this notification - the default tempalte has no options.
	 * @param {object=} params.action specifies an action to perform when the notificaiton action button is clicked on. If not set then no action button should be shown.
	 * @param {string} params.action.buttonText The text to display on the aciton button.
	 * @param {string} params.action.type The action type to perform, currently only supports the 'spawn' action.
	 * @param {string} params.action.component Component type to spawn, if using the 'spawn' action.
	 * @param {string} params.action.windowIdentifier windowIdentifier type to use with the showWindow action.
	 * @param {string} params.action.topic topic  to use with the transmit or publish actions.
	 * @param {string} params.action.params Parameters to be pass to the action.
	 * 
	 * 
	 * @example
	 *		UserNotification.notify("system", "ONCE-SINCE-STARTUP", "MANIFEST-Error", message);
	 *		UserNotification.notify("dev", "ALWAYS", "Config-Error", message, { url: notificationURL, duration: 1000 * 5 });
	 *		UserNotification.notify("dev", "MAX-COUNT", "Transport-Failure", message, { url: notificationURL, maxCount: 2 });
	 *		UserNotification.notify("dev", "ALWAYS", "myComponent-Alert", message, { action: { type: "spawn", "myComponent", { left: "center", top: "center", addToWorkspace: true, data: {} } } });
	 */
	this.notify = function (topic, frequency, identifier, message, params, cb) {
		const self = this;
		if(!params.iconURL){
			self.getDefaultIconURL(function (iconURL) {
				self.alertInternal(topic, frequency, identifier, message, iconURL, params, cb);
			}); 
		} else {
			self.alertInternal(topic, frequency, identifier, message, params.iconURL, params, cb);
		}; 
	};

	/**
	 * @private
	 */
	this.alertInternal = function (topic, frequency, identifier, message, iconURL, params, cb) {
		params = params || {};
		const timestamp = new Date();
		const duration = params.duration || 1000 * 60 * 60 * 24;
		//assign a unique id to each notification
		const key = "alert." + identifier;
		const guid = self.guid();
		const id = `notification.${guid}`;
		
		let alertUser = false;
		
		switch (frequency) {
			case "ONCE-SINCE-STARTUP":
				if (key in alertOnceSinceStartUp) {
					alertUser = false;
				} else { // if no key then must be first time
					alertUser = true;
					alertOnceSinceStartUp[key] = true;
				}
				break;
			case "MAX-COUNT":
				let currentCount = 0;
				let maxCount = params.maxCount || 1;
				if (key in alertCurrentCount) {
					currentCount = alertCurrentCount[key];
				}
				alertCurrentCount[key] = ++currentCount; // increment and store
				if (currentCount <= maxCount) {
					alertUser = true;
				}
				break;
			default: // default to "ALWAYS"
				alertUser = true;
		}

		const theNotification = {
			id: id, 
			timestamp: timestamp,
			topic: topic,
			alertUser: alertUser,
			dismissed: false, 
			frequency: frequency, 
			identifier: identifier, 
			message: message, 
			iconURL: iconURL,
			params: params 
		};
		
		//add to the id-based index
		idToNotification[id] = theNotification;

		//add to notification history
		notificationsHistory.unshift(theNotification);

		//trim history to max length
		if (notificationsHistory.length > maxNotificationsToRemember) { 
			let toDismiss = notificationsHistory.splice(-1,1)[0];
			delete	idToNotification[toDismiss.id];

			//could still be displayed... if so dismiss it
			for (let index = 0; index < notificationsDisplayed.length; index++) {
				if (notificationsDisplayed[index].id === toDismiss.id) {
					self.dismissNotification(toDismiss.id);
				}
			}
		}

		Logger.log("UserNotification.alert", id, topic, alertUser, frequency, identifier, message, params);
		console.log("UserNotification.alert", id, topic, alertUser, frequency, identifier, message, params);

		if (alertUser) {
			//TODO: need some form of queue to ensure previous display ops are complete before moving onto next notificaiton display
			//  currently if two notifications fire quickly, the showWindow calls sent to move the notificaitons around can arrive out of order (I think)
			//  resulting in two notifications on top of each other

			//add notification to array of displayed notifications
			let len = notificationsDisplayed.unshift(theNotification);

			//close any notification that will fall off end of display list
			if(len > maxNotificationsToShow) {
				RouterClient.transmit(notificationsDisplayed[maxNotificationsToShow].id+".close", {});

				//TODO: display a +N more marker above the notifications stack
			}

			//move each other notification up
			for (let index = 1; index < Math.min(len,maxNotificationsToShow); index++) {
				//theres still a bug in bottom right positioning in showWindow (spawn doesn't behave the same way), where toolbar height is added to windowHeight specified and deducted from the bottom
				let hackedHeight = notificationHeight - WINDOWS_TASKBAR_HEIGHT;
				let hackedbottom = index * (notificationGap + notificationHeight) + WINDOWS_TASKBAR_HEIGHT;
				
				const windowId = {
					windowName: notificationsDisplayed[index].id,
					componentType: "notification",
					monitor: 0 //TODO: just spawned on primary monitor, could be user preference controlled
				};
				LauncherClient.showWindow(windowId, {right: 0, bottom: hackedbottom, height: hackedHeight, width: notificationWidth});
			}

			//Display the new notification
			LauncherClient.spawn("notification",
				{
					name: theNotification.id,
					monitor: 0, //TODO: just spawned on primary monitor, could be user preference controlled
					right: 0,
					bottom: 0,
					height: notificationHeight,
					width: notificationWidth,
					addToWorkspace: false,
					data: {
						notification_id: id,
						message: message,
						iconURL: iconURL,
						params: params
					}
				}, function(err, response){
					if (err) {
						logger.error(`Failed to spawn notification, err: ${JSON.stringify(err, undefined, 2)}`);
					} 
					cb(err, theNotification);
				}
			);

			//setup a timer to auto-dismiss the notification
			setTimeout(function( ) {self.dismissNotification(id); }, duration);

			//update pub/sub for notification counts
			RouterClient.publish(COUNTS_PUBSUB_TOPIC, this.getNotificationCounts());

		} else {
			//just return the non-displayed notification
			cb (null, theNotification);
		}

		//announce update (always), with types of filter affected specified
		let updateTypes = {
			all: true,
			displayed: alertUser,
			dismissed: false
		};
		RouterClient.transmit(UPDATES_ROUTER_TOPIC, updateTypes);
	};

	/**
	 * Perform the action and dismiss the notification if displayed.
	 * @param {number} id The id of the notification whose action should be performed
	 * @param {object=} params Not currently used but will eventually allow for notifications with user input values to be passed to the action
	 * 
	 * @param {function} cb callback
	 */
	this.performAction = function(id, params, cb) {
		let notification = idToNotification[id];
		if (notification) {
			if (notification.params && notification.params.action){
				//TODO: merge parameter passed with the notification's action paramaters

				if (typeof notification.params.action === 'object') { 

					if (notification.params.action.type.toLowerCase() === 'spawn' && notification.params.action.component && notification.params.action.params) {
						LauncherClient.spawn(notification.params.action.component, notification.params.action.params);

					} else if (notification.params.action.type.toLowerCase() === 'showwindow' && notification.params.action.windowIdentifier && notification.params.action.params) {
						LauncherClient.showWindow(notification.params.action.windowIdentifier, notification.params.action.params);
				
					} else if (notification.params.action.type.toLowerCase() === 'transmit' && notification.params.action.topic && notification.params.action.params) {
						RouterClient.transmit(notification.params.action.topic, notification.params.action.params);
				
					} else if (notification.params.action.type.toLowerCase() === 'publish' && notification.params.action.topic && notification.params.action.params) {
						RouterClient.publish(notification.params.action.topic, notification.params.action.params);
				
					} else {
						let msg = `Notification id '${id} action not supported or insufficient parameters!`;
						Logger.error(msg, notification.params.action);
						console.error(msg, notification.params.action);
						cb(new Error(msg));
					}
				} else {
					let msg = `Notification id '${id} has no associated action`;
					Logger.error(msg, notification.params.action);
					console.error(msg, notification.params.action);
					cb(new Error(msg));
				}

			} //Anything other than a valid object, just dismiss it
			
			//dimiss the notification afterwards
			self.dismissNotification(id, cb);
		} else {
			let msg = `Notification id '${id} not found to performAction`;
			Logger.warn(msg);
			console.warn(msg);
			cb(new Error(msg));
		}
	};

	/**
	 * Dismiss the notification, closing it if displayed.
	 * @param {number} id The id of the notification that should be dismissed
	 * @param {function} cb callback
	 * 
	 */
	this.dismissNotification = function(id, cb) {
		Logger.info(`Dismissing notification id: ${id}`);
		let toDismiss = idToNotification[id];
		Logger.info('Notification being dismissed:', toDismiss);
		Logger.info('Notifications displayed:', notificationsDisplayed);
		let displayIndex = -1;
		let wasDisplayed = false;

		let numNotifications = notificationsDisplayed.length;
		if (toDismiss) {
			//mark it dismissed
			toDismiss.dismissed = true;

			//iterate notificationsDisplayed and find it
			for (let index = 0; index < numNotifications; index++) {
				if (notificationsDisplayed[index].id === id){
					displayIndex = index;
				}
			}
			//if found close it
			if (displayIndex > -1) {
				wasDisplayed = true;
				let redisplay = displayIndex < maxNotificationsToShow && numNotifications > maxNotificationsToShow;
		
				Logger.info('displayIndex: ' + displayIndex);
				notificationsDisplayed.splice(displayIndex, 1);

				Logger.info('Notifications displayed post splice:', notificationsDisplayed);
				
				//seems to close the notification service...
				// Finsemble.Util.getFinWindow(toDismiss.id, function(finWin) {
				// 	if (finWin) {
				// 		finWin.close();
				// 	} else {
				// 		Logger.warn("Fin window not found for displayed notification id: ", id);
				// 	}
				// });
				//use a router channel to have it close itself instead
				RouterClient.transmit(toDismiss.id+".close", {});

				//move any notifications above it down
				for (let index2 = displayIndex; index2 < Math.min(numNotifications-1,maxNotificationsToShow); index2++) {
					let hackedHeight = notificationHeight - WINDOWS_TASKBAR_HEIGHT;
					let hackedbottom = index2 * (notificationGap + notificationHeight) + WINDOWS_TASKBAR_HEIGHT;
					const windowId = {
						windowName: notificationsDisplayed[index2].id,
						componentType: "notification",
						monitor: 0 //TODO: just spawned on primary monitor, could be user preference controlled
					};
					LauncherClient.showWindow(windowId, {right: 0, bottom: hackedbottom, height: hackedHeight, width: notificationWidth});
				}

				//redisplay anything off top of display list that is coming back
				if (redisplay){
					let hackedHeight = notificationHeight - WINDOWS_TASKBAR_HEIGHT;
					//let hackedbottom = (maxNotificationsToShow-1) * (notificationGap + notificationHeight) + WINDOWS_TASKBAR_HEIGHT;
					let bottom = (maxNotificationsToShow-1) * (notificationGap + notificationHeight);
					let toRedisplay = notificationsDisplayed[maxNotificationsToShow-1];
					LauncherClient.spawn("notification",
					{
						name: toRedisplay.id,
						monitor: 0, //TODO: just spawned on primary monitor, could be user preference controlled
						right: 0,
						bottom: bottom,
						height: notificationHeight,
						width: notificationWidth,
						addToWorkspace: false,
						data: {
							notification_id: toRedisplay.id,
							message: toRedisplay.message,
							iconURL: toRedisplay.iconURL,
							params: toRedisplay.params
						}
					}, function(err, response){
						if (err) {
							logger.error(`Failed to spawn notification, err: ${JSON.stringify(err, undefined, 2)}`);
						} 
						cb(err, theNotification);
					});

					//TODO: hide any +X more marker on the notification stack
				}
			}
			//Update counts pubsub topic
			RouterClient.publish(COUNTS_PUBSUB_TOPIC, this.getNotificationCounts());

			//transmit updated data
			let updateTypes = {
				all: true,
				displayed: wasDisplayed,
				dismissed: true
			};
			RouterClient.transmit(UPDATES_ROUTER_TOPIC, updateTypes);

			if (cb) { cb(null,{}); }
		} else {
			let msg = `Notification id '${id} not found to dismiss`;
			Logger.warn(msg);
			console.warn(msg);
			if (cb) { cb(new Error(msg)); }
		}
	}

	/**
	 * Return a notification by id, if still held in the history, otherwise an error is returned.
	 * @param {number} id The id of the notification that should be returned
	 * @param {function} cb callback (err, notification)
	 * 
	 */
	this.getNotification = function(id, cb) {
		let notification = idToNotification[id];
		if (notification) {
			cb(null, notification);
		} else {
			let msg = `Notification id '${id} not found to return`;
			Logger.error(msg);
			console.log(msg);
			cb(new Error(msg));
		}
	}
	
	/**
	 * Return all notifications currently in the history array.
	 * @param {string} type (optional) Filter the list of notifications. Supports values 'all' (default), 'displayed' and 'dismissed'
	 * @param {function} cb (optional) callback (err, notificationsHistory)
	 * 
	 */
	this.getNotificationsHistory = function(type, cb) {
		let filter = FILTER_TYPES.indexOf(type) >= 0  ? type : "all";
		let out = [];
		if (filter === "all") {
			out = notificationsHistory;
		} else if (filter === "displayed") {
			out = notificationsDisplayed;
		} else if (filter === "dismissed") {
			//filter
			out = notificationsHistory.filter(notification => notification.dismissed == true);
		}
		if (cb) {
			cb(null, out);
		} else {
			return out;
		}
	}

	/**
	 * Return and object containing counts of displayed, total undismissed and dismissed notifications in the notification history.
	 * @param {function} cb (potional) callback (err, counts)
	 * 
	 */
	this.getNotificationCounts = function(cb) {
		let dismissed = 0;
		for (let n=0; n<notificationsHistory.length; n++) {
			if(notificationsHistory[n].dismissed) { dismissed++; }
		}
		let counts = {
			displayed: notificationsDisplayed.length, 
			total_undissmissed: (notificationsHistory.length - dismissed), 
			dismissed: dismissed
		};

		if (cb) {
			cb(null, counts);
		} else {
			return counts;
		}
	}

	/**
	 * Dismiss all currently displayed notifications
	 * @param {function} cb callback
	 * 
	 */
	this.dismissAllDisplayedNotifications = function(cb) {
		for (let index = notificationsDisplayed.length; index > 0; index--) {
			self.dismissNotification(notificationsDisplayed[index-1]);
		}
		cb(null,{});
	}

	/**
	 * Dismiss all currently displayed notifications
	 * @param {function} cb callback
	 * 
	 */
	this.clearNotificationsHistory = function(cb) {
		self.dismissAllDisplayedNotifications(function() {
			notificationsHistory.length = 0;
			idToNotification = {};
			cb(null, {});
		})
	}

	/**
	 * Creates a router endpoint for you service. 
	 * Add query responders, listeners or pub/sub topic as appropriate. 
	 * @private
	 */
	this.createRouterEndpoints = function () {

		//setup pub/sub topic for displayed notification count
		RouterClient.addPubSubResponder(COUNTS_PUBSUB_TOPIC, { displayed:0, total_undissmissed: 0, dismissed: 0 });

		//create query responder for API functions
		RouterClient.addResponder(API_QUERY_RESPONDER_TOPIC, function(error, queryMessage) {
			if (!error) {
				Logger.log('notificationService Query: ' + JSON.stringify(queryMessage));

				if (queryMessage.data.query === "notify") {
					if (queryMessage.data.topic && queryMessage.data.frequency && queryMessage.data.identifier && queryMessage.data.message) {
						self.notify(queryMessage.data.topic, queryMessage.data.frequency, queryMessage.data.identifier, queryMessage.data.message, queryMessage.data.params ? queryMessage.data.params : {}, queryMessage.sendQueryResponse);
					} else {
						let msg = "notify requested with insufficient data";
						Logger.error(msg, queryMessage);
						queryMessage.sendQueryResponse(new Error(msg));
					}
				} else if (queryMessage.data.query === "dismissNotification") {
					if (queryMessage.data.id){
						self.dismissNotification(queryMessage.data.id,  queryMessage.sendQueryResponse);
					} else {
						let msg = "dismissNotification requested without an id";
						Logger.error(msg, queryMessage);
						queryMessage.sendQueryResponse(new Error(msg));
					}
				} else if (queryMessage.data.query === "getNotification") {
					if (queryMessage.data.id){
						self.getNotification(queryMessage.data.id,  queryMessage.sendQueryResponse);
					} else {
						let msg = "getNotification requested without an id";
						Logger.error(msg, queryMessage);
						queryMessage.sendQueryResponse(new Error(msg));
					}
				} else if (queryMessage.data.query === "performAction") {
					if (queryMessage.data.id){
						self.performAction(queryMessage.data.id,  queryMessage.data.params ? queryMessage.data.params : {}, queryMessage.sendQueryResponse);
					} else {
						let msg = "performAction requested without an id";
						Logger.error(msg, queryMessage);
						queryMessage.sendQueryResponse(new Error(msg));
					}
				} else if (queryMessage.data.query === "getNotificationsHistory") {
					self.getNotificationsHistory(queryMessage.data.type, queryMessage.sendQueryResponse);

				}  else if (queryMessage.data.query === "getNotificationCounts") {
					self.getNotificationCounts(queryMessage.sendQueryResponse);

				}  else if (queryMessage.data.query === "dismissAllDisplayedNotifications") {
					self.dismissAllDisplayedNotifications(queryMessage.sendQueryResponse);

				}  else if (queryMessage.data.query === "clearNotificationsHistory") {
					self.clearNotificationsHistory(queryMessage.sendQueryResponse);

				} else {
					queryMessage.sendQueryResponse("Unknown query function: " + queryMessage, null);
					Logger.error("Unknown query function: ", queryMessage);
				}
			} else {
				Logger.error("Failed to setup notification query responder", error);
			}
		});	
	};

	return this;
};

notificationService.prototype = new Finsemble.baseService({
	startupDependencies: {
		// TODO: architectural review, are the notifications needed to highlight failures of any of these services and clients?
		services: ["dockingService", "authenticationService", "routerService"],
		clients: ["launcherClient", "configClient"] 
	}
});
const serviceInstance = new notificationService('notificationService');

serviceInstance.onBaseServiceReady(function (callback) {
	serviceInstance.createRouterEndpoints();
	Logger.log("notification Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;