/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

"use strict";
var Utils = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator
var BaseClient = require("./baseClient");

var Logger = require("./logger");

Logger.system.log("Starting AuthenticationClient");

/**
 * @introduction
 * <h2>Authentication Client</h2>
 *
 * The Authentication client supports two distinct areas of functionality:
 *
 * 1) The client API provides hooks for plugging in a custom sign-on component at the beginning of Finsemble startup (before application-level components are started). See <a href=tutorial-enablingAuthentication.html>Enabling Authentication</a> for an overview and example using these hooks. Only method, *publishAuthorization*, supports this capability in the Authentication Client API.
 *
 * 2) The client API also supports automatic login capabilities for Finsemble components. *Note this capability is experimental, not yet completely secure, and considered an Alpha release.*  (Please let us know if you are interested in using this functionality for production).  
 *
 * *The rest of this introduction outlines the general handshake when using Auto Sign-On.*
 *
 * 1) A component initiates a signon request using appSignOn(), which asynchronously returns a signOnData object. If the signOnData isn't already "cached" in an encrypted store, then the user will be prompted by the Authentication Service's sign-on dialog. The signOnData returned to the component includes the sign-on username and password, plus a `validationRequired` flag (more on this flag below). 
 *
 * 2) When appSignOn returns signOnData with `validationRequired=false`, then the signon data has already been verified and accepted, so it should be good for a successful login. However, if the signon fails then appSignOn should be called again with a "force" flag, causing the authentication service to bypass the stored signon data and reprompt the user. 
 *
 * 3) When appSignOn returns signOnData with `validationRequired=true`, then the signon data has not yet been verified since startup, meaning the component must either accept or reject the signon data based on whether or not the signon is successful. There are three main response cases here:
 * <br>
 *	*a)* For a successful signon, appAcceptSignon() is invoked, letting the Authentication Service know the signon data is good and should be saved.
 * <br>
 *	*b)* For an unsuccessful signon, typically appRejectAndRetrySignOn() is called, letting the Authentication Service know to both reject the recent signon data and try again (i.e. prompting the user again and returning another set of data).
 * <br>
 *	*c)* For an unsuccessful signon that will not be retried (essentially giving up, perhaps because of multiple previous attempts), appRejectSignOn is called, letting the Authentication Service know to reject the data (with no retries).
 *
 * Automatic signon handles multiple parallel request for the same sign-on data.  The first request received will be processed and the others queued.  After the first request is complete (i.e. accepted or rejected), then the queued requests will all be responded to with the results of the first request.  
 *
 * *Note: When a signon response is expected by the Authentication Service, there must a response within two minutes (after user data has been entered) or an automatic rejection will be triggered (meaning the signon data will not be saved in the encrypted store).*
 * *
 * @hideConstructor true
 * @constructor
 */
var AuthenticationClient = function (params) {
	var self = this;
	BaseClient.call(this, params);

	/**
	 * After authentication is complete, the authentication component must invoke this function to notify the authentication service of the authenticated username and authorization credentials. When notified, the authentication service publishes the username and authorization data to all interested subscribers, then signals for the startup sequence to continue.
	 *
	 * To receive the authorization information (published by the service after this function is invoked), any Finsemble component or service can subscribe to the SubPub "Authorization" topic (e.g. this.routerClient.subscribe("Authorization", authNoticationCallback));
	 *
	 * Note if the authentication expires after a time interval, it is up to the authentication component to periodically reauthenticate and publish updated information by invoking this function again. It is also up to the authentication component developer to specify how the authorization credentials should by used when communicating with specific external services.
	 *
	 * It is worth noting the authenticated username is always passed by the authentication service to the storage client using {@link StorageClient#setUser} to define the context for all user storage (i.e. saved workspaces, config, etc). When authentication is disabled, "defaultUser" is automatically passed to the storage service for the username.
	 *
	 * @param {string} user the name of the authenticated user
	 * @param {object} credentials the authorization credentials (or token) for the current user, as specified by the application's authentication component.
	 * @example
	 *
	 * FSBL.Clients.AuthenticationClient.publishAuthorization(username, credentials);
	 */
	this.publishAuthorization = function (user, credentials) {
		Logger.system.debug("publishAuthorization for " + user + " credentials: " + JSON.stringify(credentials));
		Validate.args(user, "string", credentials, "object");
		this.routerClient.transmit("AuthenticationService.authorization", { user: user, credentials: credentials });
	};

	/**
	 * ALPHA Automatic SignOn Function. Not used by components signing on, but only by "system dialog" component that prompts the user for signon data.  This command will send the user-input signon data back to the Authentication Service. 
	 * 
	 * @param {any} signOnData 
	 */
	this.transmitSignOnToAuthService = function (signOnData) {
		Logger.system.log("transmitSignOnToAuthService", signOnData);
		Validate.args(signOnData, "object");
		this.routerClient.transmit("authentication.dialogSignOnToAuthService", signOnData);
	};

	/**
	 * ALPHA Automatic SignOn Function. Returns the signon data after either prompting user or getting a cached version.   
	 * 
	 * @param {string} signOnKey component-defined unique identifier string representing the signon data (the same string must be used for each unique signon)
	 * @param {object} params object { icon, prompt, force, userMsg }.  `icon` is a url to icon to displace in signon dialog. `prompt` is a string to display in signon dialog. `force` indicates if signon dialog should be used even if accepted signon data is available in the encrypted store. `userMsg` is an option message to be displayed for user in signon dialog
	 * @param {function} cb callback function(err,response) with the response being an object: { signOnKey, username, password, validationRequired } 
	 */
	this.appSignOn = function (signOnKey, params, cb) {
		Validate.args(signOnKey, "string", params, "object", cb, "function");
		this.routerClient.query("authentication.appSignOn", { signOnKey, params }, { timeout: -1 }, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};
	
	/**
	 * ALPHA Automatic SignOn Function. Rejects previous signon data and restarts signon. Returns the signon data after either prompting user or getting a cached version. Should only be called when validationRequired is true in signon response.  
	 * 
	 * @param {any} signOnKey
	 * @param {object} params object { userMsg } where `userMsg` is an option message to be displayed for user in signon dialog
	 * @param {any} cb 
	 */
	this.appRejectAndRetrySignOn = function (signOnKey, params, cb) {
		Logger.system.log("appRejectAndRetrySignOn", signOnKey);
		Validate.args(signOnKey, "string", params, "object", cb, "function");
		this.routerClient.query("authentication.appRejectAndRetrySignOn", { signOnKey, params }, { timeout: -1 }, function (err, response) {
			if (cb) {
				cb(err, response.data);
			}
		});
	};

	/**
	 * ALPHA Automatic SignOn Function. Accepts the data returned by appSignOn, causing the data to be saved for future use. Should only be called when validationRequired is true in signon response.
	 * 
	 * @param {any} signOnKey 
	 */
	this.appAcceptSignOn = function (signOnKey) {
		Logger.system.log("appAcceptSignOn", signOnKey);
		Validate.args(signOnKey, "string");
		this.routerClient.transmit("authentication.appAcceptSignOn", { signOnKey });
	};

	/**
	 * ALPHA Automatic SignOn Function. Rejects the data returned by previous signon. Should only be called when validationRequired is true in signon response.
	 * 
	 * @param {any} signOnKey 
	 */
	this.appRejectSignOn = function (signOnKey) {
		Logger.system.log("appRejectSignOn", signOnKey);
		Validate.args(signOnKey, "string");
		this.routerClient.transmit("authentication.appRejectSignOn", { signOnKey });
	};
};

var authenticationClient = new AuthenticationClient({
	onReady: function (cb) {
		Logger.system.log("authenticationClient online");
		if (cb) {
			cb();
		}
	},
	name: "authenticationClient"
});
authenticationClient.requiredServices = [];
module.exports = authenticationClient;