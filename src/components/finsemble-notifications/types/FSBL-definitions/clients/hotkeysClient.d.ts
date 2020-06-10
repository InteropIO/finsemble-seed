/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { _BaseClient as BaseClient } from "./baseClient";
import { StandardCallback } from "../globals";
export declare class HotkeyClient extends BaseClient {
    /**
    * @introduction
    *
    * <h2>Hotkey Client</h2>
    *
    * This module contains the Hotkey Client, used for registering hotkey combinations and their respective handler functions with Finsemble.
    *
    * The client can handle two types of hotkeys: **local hotkeys**, for which the handlers will only fire when the window which defined the hotkey is in focus, and **global hotkeys**, which will fire regardless of what window is in focus.
    *
    * For more information, see the [Hotkey tutorial](tutorial-Hotkeys.html).
    *
    *
    *
    * @constructor
    * @hideconstructor
    * @publishedName HotkeyClient
    * @param {*} params
    */
    keyMap: any;
    localListeners: any;
    KeyStroke: any;
    constructor(params: any);
    /**
     *Adds a local hotkey which fires only when the window calling the method is in focus. If you execute this function more than once for the same key combination, both hotkeys will coexist, and would need to be removed separately.
     * @param {Array.<string>} keyArr Array of strings representing hotkey key combination.
     * @param {function} handler Function to be executed when the hotkey combination is pressed. It is recommended that you define a variable to represent the handler function, as the same function must be passed in order to remove the hotkey.
     * @param {StandardCallback} cb Callback to be called after local hotkey is added.
     * @example
     * var myFunction = function () {...}
     * FSBL.Clients.HotkeyClient.addLocalHotkey(["ctrl", "shift", "s"], myFunction, cb)
     */
    addLocalHotkey(keyArr: string[], handler: Function | any, cb?: StandardCallback): void;
    /**
     *Adds a local hotkey, firing only when the window calling the method is in focus. If you execute this function more than once for the same key combination, both hotkeys will coexist, and would need to be remove separately.
     * This function uses browser key capture, so it will work when assimilation is not running
     * @param {Array} [keyArr] Array of strings representing hotkey key combination.
     * @param {function} [handler] Function to be executed when the hotkey combination is pressed. It is recommended that you define a variable to represent the handler function, as the same function must be passed in order to remove the hotkey.
     * @param {function} cb Callback to be called after local hotkey is added.
     * @todo Have addLocalHotkey automatically use this when assimilation is not running. Will eventually replace addLocalHotkey.
     * @private
     * @example
     * var myFunction = function () {...}
     * FSBL.Clients.HotkeyClient.addBrowserHotkey(["ctrl","shift","s"],myFunction,cb)
     */
    addBrowserHotkey(keyArr: string[], handler: Function): void;
    /**
     *Removes a local hotkey.
     * @param {Array.<string>} keyArr Array of strings representing hotkey key combination.
     * @param {function} handler Handler registered for the hotkey to be removed.
     * @param {StandardCallback} cb Callback to be called after local hotkey is removed.
     * @example
     *
     * FSBL.Clients.HotkeyClient.removeLocalHotkey(["ctrl", "shift", "s"], myFunction, cb)
     */
    removeLocalHotkey(keyArr: string[], handler: Function | any, cb?: StandardCallback): void;
    /**
     *Adds a global hotkey which fires regardless of what window is in focus. If you execute this function more than once for the same key combination, both hotkeys will coexist, and would need to be removed separately.
     * @param {Array.<string>} keyArr Array of strings representing a hotkey key combination.
     * @param {function} handler Function to be executed when the hotkey combination is pressed. It is recommended that you define a variable to represent the handler function, as the same function must be passed in order to remove the hotkey.
     * @param {StandardCallback} cb Callback to be called after local hotkey is added.
     * @example
     * var myFunction = function () {...}
     * FSBL.Clients.HotkeyClient.addGlobalHotkey(["ctrl", "shift", "s"], myFunction, cb)
     */
    addGlobalHotkey(keyArr: string[], handler: Function | any, cb?: StandardCallback): void;
    /**
     *Removes a global hotkey.
     * @param {Array.<string>} keyArr Array of strings representing hotkey key combination.
     * @param {function} handler Handler registered for the hotkey to be removed.
     * @param {StandardCallback} cb Callback to be called after local hotkey is removed.
     * @example
     *
     * FSBL.Clients.HotkeyClient.removeGlobalHotkey(["ctrl", "shift", "s"], myFunction, cb)
     */
    removeGlobalHotkey(keyArr: string[], handler: Function | any, cb?: StandardCallback): void;
    /**
     * Not yet implemented - will return an object that contains all registered Hotkeys
     */
    /**
     * Handler for "hotkey triggered" messages from the service, called upon client initialization.
     * @private
     */
    listenForHotkeys(): void;
    /**
     * Unregister all hotkeys, both locally and service-side.
     * @param {StandardCallback} cb Optional callback function
     *
     */
    removeAllHotkeys(cb: StandardCallback): void;
    /**
     * Automatically unregister all hotkeys when the window containing the client closes
     * @param {function} cb
     * @private
     */
    onClose: (cb: any) => void;
}
declare var hotkeyClient: HotkeyClient;
export default hotkeyClient;
