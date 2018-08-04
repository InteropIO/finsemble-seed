// Exported functions can be imported into your components as follows:
// import {myFunction} from '../../services/notification/notificationClient';

// Doing so allows service functions to be used as if they were local, e.g.:
// myFunction(function(err, response) {
//     if (err) {
//         Logger.error("Failed to call myFunction!", err);
//     } else {
//         Logger.log("called myFunction: ", response);
//     }
// });

// alternatively import the entire class of functions:
// import * as serviceClient from '../../services/notification/notificationClient';
// serviceClient.myFunction(function(err, response) {
//     if (err) {
//         Logger.error("Failed to call myFunction!", err);
//     } else {
//         Logger.log("called myFunction: ", response);
//     }
// });

const UPDATES_ROUTER_TOPIC = "notification update";

/**
 * Subscribe to the notifier to receive details of notification lists that have been updated. 
 * Receives an object with fields indicating which filter types were updated.
 * { all: true, displayed: wasDisplayed, dismissed: true };
 * @param {function} cb (error, response) 
 */
export function listenForUpdates(cb) {
    FSBL.Clients.RouterClient.addListener(UPDATES_ROUTER_TOPIC, function (error, response) {    
        if (error) {
            FSBL.Clients.Logger.error("notificationClient: notification update listener error", error);
        }
        cb(error, response.data);
    });
}

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
 * @param {function} cb callback (err, response)
 * 
 * @example
 *		UserNotification.notify("system", "ONCE-SINCE-STARTUP", "MANIFEST-Error", message);
    *		UserNotification.notify("dev", "ALWAYS", "Config-Error", message, { url: notificationURL, duration: 1000 * 5 });
    *		UserNotification.notify("dev", "MAX-COUNT", "Transport-Failure", message, { url: notificationURL, maxCount: 2 });
    *		UserNotification.notify("dev", "ALWAYS", "myComponent-Alert", message, { action: { type: "spawn", "myComponent", { left: "center", top: "center", addToWorkspace: true, data: {} } } });
    */
export function notify(topic, frequency, identifier, message, params, cb) {
    FSBL.Clients.Logger.log("notificationClient: notify called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "notify", topic: topic, frequency: frequency, identifier: identifier, message: message, params: params}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to notify", err);
        } else {
            FSBL.Clients.Logger.log("notificationClient: notify response: ", response);
        }
        if (cb){ 
            cb(err, response); 
        }
    });
}

/**
 * Dismiss the notification, closing it if displayed.
 * @param {number} id The id of the notification that should be dismissed
 * @param {function} cb callback
 * 
 */
export function dismissNotification(id, cb) {
    FSBL.Clients.Logger.log("notificationClient: dismissNotification called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "dismissNotification", id: id}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to alert", err);
        } else {
            FSBL.Clients.Logger.log("notificationClient: dismissNotification response: ", response);
        }
        if (cb){ 
            cb(err, response); 
        } 
    });
}

/**
 * Return a notification by id, if still held in the history, otherwise an error is returned.
 * @param {number} id The id of the notification that should be returned
 * @param {function} cb callback (err, notification)
 * 
 */
export function getNotification(id, cb) {
    FSBL.Clients.Logger.log("notificationClient: getNotification called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "getNotification", id: id}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to getNotification", err);
        } else {
            FSBL.Clients.Logger.log("notificationClient: getNotification response: ", response);
        }
        if (cb){ 
            cb(err, response); 
        } 
    });
}

/**
 * Perform the action and dismiss the notification if displayed.
 * @param {number} id The id of the notification whose action should be performed
 * @param {object=} params Not currently used but will eventually allow for notifications with user input values to be passed to the action
 * 
 * @param {function} cb callback
 */
export function performAction(id, params, cb) {
    FSBL.Clients.Logger.log("notificationClient: performAction called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "performAction", id: id, params: params}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to performAction", err);
        } else {
            FSBL.Clients.Logger.log("notificationClient: performAction response: ", response);
        }
        if (cb){ 
            cb(err, response); 
        } 
    });
}

/**
 * Return all notifications currently in the history array.
 * @param {string} type (optional) Filter the list of notifications. Supports values 'all' (default), 'displayed' and 'dismissed'
 * @param {function} cb (optional) callback (err, notificationsHistory)
 * 
 */
export function getNotificationsHistory(type, cb) {
    FSBL.Clients.Logger.log("notificationClient: getNotificationsHistory called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "getNotificationsHistory", type: type}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to getNotificationsHistory", err);
        } else {
            FSBL.Clients.Logger.log("notificationClient: getNotificationsHistory response: ", response);
        } 
        if (cb){
            cb(err, response && response.data ? response.data : response); 
        }
    });
}
/**
 * Dismiss all currently displayed notifications
 * @param {function} cb callback
 * 
 */
export function dismissAllDisplayedNotifications(cb) {
    FSBL.Clients.Logger.log("notificationClient: dismissAllDisplayedNotifications called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "dismissAllDisplayedNotifications"}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to dismissAllDisplayedNotifications", err);
        } else {
            FSBL.Clients.Logger.info("notificationClient: dismissAllDisplayedNotifications response: ", response);
        } 
        if (cb){ 
            cb(null, response); 
        } 
    });
}

/**
 * Dismiss all currently displayed notifications
 * @param {function} cb callback
 * 
 */
export function clearNotificationsHistory(cb) {
    FSBL.Clients.Logger.log("notificationClient: clearNotificationsHistory called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "clearNotificationsHistory"}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to clearNotificationsHistory", err);
        } else {
            FSBL.Clients.Logger.log("notificationClient: clearNotificationsHistory response: ", response);
        } 
        if (cb){ 
            cb(null, response); 
        } 
    });
}

