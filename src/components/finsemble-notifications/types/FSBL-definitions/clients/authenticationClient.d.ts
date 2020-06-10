/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { _BaseClient as BaseClient } from "./baseClient";
import { SpawnParams } from "../services/window/Launcher/launcher";
import { StandardCallback } from "../globals";
/**
 * @introduction
 * <h2>Authentication Client</h2>
 *
 * The Authentication Client supports three distinct areas of functionality:
 *
 *  1) The client API provides hooks for plugging in a custom sign-on component at the beginning of Finsemble start-up (before application-level components are started).
 *
 * 2) The client API provides hooks for running authentication processes dynamically via "authentication profiles."
 *
 * 3) The client API provides automatic login capabilities for Finsemble components (password auto-fill).
 *
 * See the <a href=tutorial-Authentication.html>Authentication tutorial</a> for an overview of using the Authentication Client.
 *
 * @hideconstructor
 * @constructor
 */
export declare class AuthenticationClient extends BaseClient {
    isInAService: boolean;
    constructor(params: any);
    /**
     * During Finsemble's start-up process, this function must be invoked before Finsemble will start the application.
     * Once invoked, the authenticated user name and authorization credentials are received by the Authentication Service and published on the "AuthenticationService.authorization" channel.
     * Any component can revive the credentials by subscribing to that channel or by calling <a href="AuthenticationClient.html#getCurrentCredentials">getCurrentCredentials</a>.
     *
     * Note that all calls to Storage Client are keyed to the authenticated user. See <a href="StorageClient.html#setUser">StorageClient#setUser</a>.
     * If authentication is not enabled, then "defaultUser" is used instead.
     *
     * @param {string} user The name of the authenticated user
     * @param {any} credentials The authorization credentials (or token) for the current user, as specified by the application's authentication component.
     * @example
     *
     * FSBL.Clients.AuthenticationClient.publishAuthorization(username, credentials);
     */
    publishAuthorization: (user: string, credentials: any) => void;
    /**
     * Returns the current global credentials (as published through <a href="AuthenticationClient.html#publishAuthorization">publishAuthorization</a>) or null if no credentials are set yet.
     * @param {StandardCallback} cb A function that returns the current credentials. Will return null/undefined if no credentials have yet been established.
     * @since TBD
     */
    getCurrentCredentials: (cb: StandardCallback<string | Error | import("../../../../../../../Users/CWatson/CIQDev/_FINSEMBLE/finsemble/src/globals").CallbackError, any>) => void;
    /**
     * Automatic sign-on Function. Not used by components signing on, but only by "system dialog" component that prompts the user for sign on data. This command will send the user-input sign-on data back to the Authentication Service.
     *
     * @param {object} signOnData
     */
    transmitSignOnToAuthService: (signOnData: object) => void;
    /**
     * ALPHA Automatic sign-on Function. Returns the sign on data after either prompting user or getting a cached version.
     *
     * @param {string} signOnKey component-defined unique identifier string representing the sign-on data (the same string must be used for each unique sign on).
     * @param {object} params
     * @param {string} params.icon a URL to an icon that displaces the Finsemble icon for the sign-on dialog.
     * @param {string} params.prompt A string to display in the sign on dialog.
     * @param {boolean} params.force Whether the sign-on dialog should be used even if accepted sign-on data is available in the encrypted store.
     * @param {string} params.userMsg Optional parameter to be displayed for the user in the sign-on dialog.
     * @param {function} cb callback (err,response) with the response being an object: { signOnKey, username, password, validationRequired }
     * @private
     */
    appSignOn: (signOnKey: any, params: {
        icon: string;
        prompt: string;
        force: boolean;
        userMsg?: string;
    }, cb: StandardCallback<string | Error | import("../../../../../../../Users/CWatson/CIQDev/_FINSEMBLE/finsemble/src/globals").CallbackError, any>) => void;
    /**
     * ALPHA Automatic sign-on Function. Rejects previous sign-on data and restarts sign on. Returns the sign-on data after either prompting user or getting a cached version. Should only be called when `validationRequired` is `true` in sign-on response.
     *
     * @param {string} signOnKey
     * @param {object} params object
     * @param {string} params.userMsg An optional message to be displayed for the user in the sign-on dialog
     * @param {StandardCallback} cb
     * @private
     */
    appRejectAndRetrySignOn: (signOnKey: string, params: {
        userMsg?: string;
    }, cb: StandardCallback<string | Error | import("../../../../../../../Users/CWatson/CIQDev/_FINSEMBLE/finsemble/src/globals").CallbackError, any>) => void;
    /**
     * ALPHA Automatic sign-on Function. Accepts the data returned by `appSignOn`, causing the data to be saved for future use. Should only be called when `validationRequired` is `true` in sign-on response.
     *
     * @param {string} signOnKey
     * @private
     */
    appAcceptSignOn: (signOnKey: any) => void;
    /**
     * ALPHA Automatic sign-on Function. Rejects the data returned by previous sign on. Should only be called when validationRequired is true in sign-on response.
     *
     * @param {string} signOnKey
     * @private
     */
    appRejectSignOn: (signOnKey: any) => void;
    /**
     * Completes an OAuth2 authentication that was begun with <a href="AuthenticationClient.html#beginAuthentication">beginAuthentication</a>.
     * This function is called when an OAuth2 response is completed.
     * You should call this function from within the page that you specified in "redirect_uri" in your Authentication Profile config.
     * @param {string} error The error to be returned if the method fails.
     * @param {any} params Optionally pass the OAuth2 query string parameters from your response page. Set to null and the query string will automatically be parsed based on the OAuth2 specification.
     * @param {StandardCallback} cb Returns the result (err, data). Data will contain the results of the authentication process, such as the access_token and other values provided by your Identify Provider.
     * @since TBD
     */
    completeOAUTH: (err?: string, params?: any, cb?: StandardCallback<string | Error | import("../../../../../../../Users/CWatson/CIQDev/_FINSEMBLE/finsemble/src/globals").CallbackError, any>) => void;
    /**
     * Starts an authentication process. The callback will be triggered when the authentication is totally complete.
     * Use this method if you have a component that needs to complete an authentication process, such as OAuth2.
     *
     * You must set up an "authentication profile" in your Finsemble config. Reference the name of that profile
     * in params.profile.
     *
     * @param {object} params Parameters
     * @param {string} params.profile The name of the authentication profile from the authentication config section. See <a href="tutorial-ConfigReference.html">"startup"</a> for instance.
     * @param {SpawnParams} params.spawnParams Optionally specify parameters to send to spawn for spawning an authentication window. These parameters are the same as those found in <a href="LauncherClient.html#spawn">LauncherClient#spawn</a>.
     * @param {StandardCallback} cb Returns an object containing the authentication response, i.e., OAuth credentials, etc
     */
    beginAuthentication(params: {
        profile?: string;
        spawnParams?: SpawnParams;
    }, cb: StandardCallback): void;
    /**
     * @private
     *
     * @memberof AuthenticationClient
     */
    start: (cb: any) => void;
}
declare var authenticationClient: AuthenticationClient;
export default authenticationClient;
