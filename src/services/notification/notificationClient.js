export function alert(textContent, action, cb) {
    FSBL.Clients.Logger.info("notificationClient: alert called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "alert", textContent: textContent, action: action }, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to alert", err);
        } else {
            FSBL.Clients.Logger.info("notificationClient: alert response: ", response);
        }
        if (cb){ 
            cb(err, response); 
        }
    });
}

export function dismissNotification(id, cb) {
    FSBL.Clients.Logger.info("notificationClient: dismissNotification called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "dismissNotification", id: id}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to alert", err);
        } else {
            FSBL.Clients.Logger.info("notificationClient: dismissNotification response: ", response);
        }
        if (cb){ 
            cb(err, response); 
        } 
    });
}

export function getNotification(id, cb) {
    FSBL.Clients.Logger.info("notificationClient: getNotification called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "getNotification", id: id}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to getNotification", err);
        } else {
            FSBL.Clients.Logger.info("notificationClient: getNotification response: ", response);
        }
        if (cb){ 
            cb(err, response); 
        } 
    });
}

export function performAction(id, params, cb) {
    FSBL.Clients.Logger.info("notificationClient: performAction called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "performAction", id: id, params: params}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to performAction", err);
        } else {
            FSBL.Clients.Logger.info("notificationClient: performAction response: ", response);
        }
        if (cb){ 
            cb(err, response); 
        } 
    });
}

export function getNotificationsHistory(cb) {
    FSBL.Clients.Logger.info("notificationClient: getNotificationsHistory called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "getNotificationsHistory"}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to getNotificationsHistory", err);
        } else {
            FSBL.Clients.Logger.info("notificationClient: getNotificationsHistory response: ", response);
        } 
        if (cb){
            cb(err, response && response.data ? response.data : response); 
        }
    });
}
export function getDisplayedNotifications(cb) {
    FSBL.Clients.Logger.info("notificationClient: getDisplayedNotifications called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "getDisplayedNotifications"}, function (err, response) {
        FSBL.Clients.Logger.log("notificationClient: getDisplayedNotifications response: ", response);
        if (err) {
            FSBL.Clients.Logger.error("Failed to getDisplayedNotifications", err);
        } else {
            FSBL.Clients.Logger.info("notificationClient: getDisplayedNotifications response: ", response);
        } 
        if (cb){
            cb(err, response && response.data ? response.data : response); 
        }
    });
}

export function dismissAllDisplayedNotifications(cb) {
    FSBL.Clients.Logger.info("notificationClient: dismissAllDisplayedNotifications called");
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

export function clearNotificationsHistory(cb) {
    FSBL.Clients.Logger.info("notificationClient: clearNotificationsHistory called");
    FSBL.Clients.RouterClient.query("notification functions", { query: "clearNotificationsHistory"}, function (err, response) {
        if (err) {
            FSBL.Clients.Logger.error("Failed to clearNotificationsHistory", err);
        } else {
            FSBL.Clients.Logger.info("notificationClient: clearNotificationsHistory response: ", response);
        } 
        if (cb){ 
            cb(null, response); 
        } 
    });
}

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
// import * as serviceClient from '../../services/notification/notificationClient'
// serviceClient.myFunction(function(err, response) {
//     if (err) {
//         Logger.error("Failed to call myFunction!", err);
//     } else {
//         Logger.log("called myFunction: ", response);
//     }
// });