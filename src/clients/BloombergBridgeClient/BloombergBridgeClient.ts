

import "@finsemble/finsemble-core"
import { ILogger } from "clients/ILogger";
import { IRouterClient, RouterMessage } from "clients/IRouterClient";

// import type { ILogger } from "clients/ILogger";

/** Timeout in milliseconds for terminal connection checks that will cause a checkConnection
 * call to fail. */
const CONNECTION_CHECK_TIMEOUT = 1000;
// tslint:disable:no-console

/**
 * Interface representing an event handler for connection events, which are fired
 * when the BloombergBridge connects or disconnects from the terminal.
 */
interface BBGConnectionEventListener extends StandardCallback {
    (
        /** Errors received from Terminal connect - most likely on registration of
         * the listener. */
        err: (string | Error),
        /** Flags indicating if the BloombergBridge is registered with the terminal
         * through terminal connect and whether the user is logged in. Both flags
         * need to be true for any of the client functions, other than checkConnection
         * to function.
        */
        response: RouterMessage<{ registered: boolean, loggedIn: boolean }>,
    ): void;
}

/**
 * Interface representing an event handler for Bloomberg group events.
 */
interface BBGGroupEventListener extends StandardCallback {
    (
        /** Errors received from Terminal connect - most likely on registration of
         * the listener. */
        err: (string | Error),
        /** Details relating to BlpComponentContextChangedEventArgs messages received from
         * Terminal connect. These will usually relate to single group and reflect changes
         * in the group's context or creation of a group, which will generate context changed
         * event, but for a group that did not previously exist.*/
        response: RouterMessage<{ group: BBGGroup, groups: BBGGroup[] }>,
    ): void;
}

/**
 * Interface representing a Bloomberg worksheet.
 */
interface BBGWorksheet {
    /** The name of the worksheet (non-unique). */
    id: string;
    /** The name of the worksheet assigned by the Bloomberg terminal and globally unique. */
    name: string;
    /** A flag indicating the Worksheet's IsActive status. */
    isActive: boolean;
}

/**
 * @param {string} type The type of the group: security or monitor.
 * @param {string} name The name of the group assigned by the Bloomberg terminal, usually takes =
 * the form 'Group-A'.
 * @param {string} value the current value of the group.
 */
interface BBGGroup {
    type: string;
    name: string;
    value: string;
}

/**
 * Client class for communicating with the Finsemble Bloomberg Bridge over the the Finsemble Router,
 * which in turn communicates with the Bloomberg Terminal via the Terminal Connect and BLP APIs.
 *
 * This Class may either be imported into code and initialized by passing in an instance
 * of the Finsemble RouterClient and Logger (e.g. in Finsemble Custom Desktop Service) or
 * used as a preload to be applied to a component, where it will be automatically initialized
 * via instances of the RouterClient and Logger referenced from `FSBL.Clients`.
 */
export default class BloombergBridgeClient {
    private connectionEventListener: BBGConnectionEventListener | null = null;
    private groupEventListener: BBGGroupEventListener | null = null;
    private routerClient: IRouterClient | null = null;
    private logger: ILogger | null = null;

    /**
     * BloombergBridgeClient constructor.
     * @param routerClient An instance of the Finsemble router client to be used for all =
     * communication. If not passed it will be retrieved from FSBL.Clients.RouterClient or
     * an exception.
     * @param logger An instance of the Finsemble Logger to be used log messages. If not
     * passed it will be retrieved from FSBL.Clients.Logger or an exception.
	 * @example Instantiating the client in a Finsemble component:
	 * ```Javascript
	 * let bbg = new BloombergBridgeClient(FSBL.Clients.RouterClient, FSBL.Clients.Logger);
	 * ```
	 *
	 * Instantiating the client in a Finsemble service:
	 * ```Javascript
	 * const Finsemble = require("@chartiq/finsemble");
	 * Finsemble.Clients.Logger.start();
	 * Finsemble.Clients.Logger.log("test Service starting up");
	 * let bbg = new BloombergBridgeClient(Finsemble.Clients.RouterClient, Finsemble.Clients.Logger);
	 * ```
     */
    constructor(routerClient?: IRouterClient, logger?: ILogger) {
        if (routerClient) {
            this.routerClient = routerClient;
        } else if (FSBL){
            this.routerClient = FSBL.Clients.RouterClient;
        } else {
            throw new Error('No RouterClient was passed to the constructor and FSBL.Clients.RouterClient was not found!');
        }
        if (logger) {
            this.logger = logger;
        } else if (FSBL){
            this.logger = FSBL.Clients.Logger;
        } else {
            throw new Error('No Finsemble Logger client was passed to the constructor and FSBL.Clients.Logger was not found!');
        }
    }

    /**
     * Set a handler function for connection events.
     *
     * Note that only one handler function is permitted, hence calling
     * this multiple times will simply replace the existing handler.
     *
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * let connectionEventHandler = (err, resp) => {
	 *     if (!err && resp && resp.loggedIn) {
	 *         showConnectedIcon();
	 *     } else {
	 *         showDisconnectedIcon();
	 *     }
	 * };
	 * bbg.setConnectionEventListener(connectionEventHandler);
	 * ```
     */
    setConnectionEventListener(cb: BBGConnectionEventListener) {
        if (this.connectionEventListener) {
            this.removeConnectionEventListener();
        }

        console.log('Added new event listener for Bloomberg connection events.');
        this.connectionEventListener = (err: any, response: any) => {
            if (err) {
                console.error('Received Bloomberg connection error: ', err);
            } else {
                console.log('Received Bloomberg connection event: ', response);
            }
            cb(err, response);
        };
        this.routerClient?.addListener('BBG_connection_status', this.connectionEventListener);
    }

    /**
     * Remove the current connection event handler.
	 * @example
	 * ```Javascript
	 * bbg.removeConnectionEventListener();
	 * ```
     */
    removeConnectionEventListener() {
        if (this.connectionEventListener) {
            this.routerClient?.removeListener('BBG_connection_status', this.connectionEventListener);
            console.log('Removed Bloomberg connection event listener');
        } else {
            console.warn('Tried to remove non-existent connection event listener');
        }
    }


    /**
     * Set a handler function for Launchpad group context changed events, which
     * are fired when a group's context changes or a new group is created.
     *
     * Note that only one handler function is permitted, hence calling
     * this multiple times will simply replace the existing handler.
     * @param cb Handler function to call on group context change events
	 * @example
	 * ```Javascript
	 * bbg.setGroupEventListener((err, response) => {
	 *     if (!err) {
	 *         if (response.data.group && response.data.group.type == "monitor") {
	 *             console.log("Monitor event:\n" + JSON.stringify(response.data, null, 2));
	 *         } else {
	 *             console.log("Security event:\n" + JSON.stringify(response.data, null, 2));
	 *         }
	 *     } else {
	 *             console.error("Error returned from setGroupEventListener", err);
	 *     }
	 * });
	 * ```
     */
    setGroupEventListener(cb: BBGGroupEventListener) {
        if (this.groupEventListener) {
            this.removeGroupEventListener();
        }
        console.log('Set new listener for Bloomberg group context events...');
        this.groupEventListener = (err: any, response: any) => {
            if (err) {
                console.error('Received Bloomberg group context error: ', err);
            } else {
                console.log('Received Bloomberg group context event: ', response);
            }
            cb(err, response);
        };
        this.routerClient?.addListener('BBG_group_context_events', this.groupEventListener);
    }

    /**
     * Remove the current group context changed event handler.
	 * @example
	 * ```Javascript
	 * bbg.removeGroupEventListener();
	 * ```
     */
    removeGroupEventListener() {
        if (this.groupEventListener) {
            this.routerClient?.removeListener('BBG_group_context_events', this.groupEventListener);
            console.log('Removed group context event listener');
        } else {
            console.warn('Tried to remove non-existent group context event listener');
        }
    }

    /**
     * Check that Bloomberg bridge is connected to the Bloomberg Terminal and that a user is
     * logged in.
     * @param cb Callback for connection response that will return response as true if we are
     * connected and logged in.
	 * @example
	 * ```Javascript
	 * let checkConnectionHandler = (err, loggedIn) => {
	 *     if (!err && loggedIn) {
	 *         showConnectedIcon();
	 *     } else {
	 *         showDisconnectedIcon();
	 *     }
	 * };
	 * bbg.checkConnection(checkConnectionHandler);
	 * ```
     */
    checkConnection(cb: (err: string | CallbackError | Error | null, response: boolean | null) => void) {
        console.log('Checking connection status...');

        // if we don't get a response something is wrong
        const timeout = setTimeout(() => {
            console.log('BBG_connection_status check timed-out', null);
            cb('Connection check timeout', null);
        }, CONNECTION_CHECK_TIMEOUT);

        void this.routerClient?.query('BBG_connection_status', {}, (err, resp: { data?: { loggedIn: boolean } }) => {
            clearTimeout(timeout);
            if (err) {
                console.warn('Received error when checking connection status: ', err);
                cb(err, false);
            } else {
                if (resp && resp.data && resp.data['loggedIn']) {
                    console.log('Received connection status: ', resp.data);
                    cb(null, true);
                } else {
                    console.log('Received negative or empty response when checking connection status: ', resp);
                    cb('Received negative or empty response when checking connection status', null);
                }
            }
        });
    }

    /**
     * Internal function used to send a Query to the BBG_run_terminal_function responder of
     * BloombergBridge,
     * which implements the majority functions for the BloombergBridgeClient.
     * @param message The query data to pass.
     * @param message.function Required field that determines which function to run.
     * @param cb Callback
	 * @private
     */
    queryBloombergBridge(
        message: { function: string },
        // cb: (err: string | Error, response: unknown) => void,
        cb: StandardCallback,
    ) {
        console.log('BBG_run_terminal_function query:', message);
        this.logger?.log('BBG_run_terminal_function query:', message);
        void this.routerClient?.query('BBG_run_terminal_function', message, this.apiResponseHandler(cb));
    }

    /**
     * Internal function used to return a call back that will wrap the supplied callback and log all
     * responses
     * from the Bloomberg Bridge to aid debugging.
     * @param cb Callback
	 * @private
     */
    apiResponseHandler(cb: StandardCallback) {
        return (err: StandardError, response: { data: { status: boolean } }) => {
            if (err) {
                const errMsg = 'Error returned by BBG_run_terminal_function: ';
                console.error(errMsg, err);
                this.logger?.error(errMsg, err);
                cb(err, null);
            } else if (!response || !response.data || !response.data.status) {
                const errMsg = 'Negative status returned by BBG_run_terminal_function: ';
                console.warn(errMsg, response);
                this.logger?.warn(errMsg, response);
                cb('Command returned negative status', null);
            } else {
                const msg = 'BBG_run_terminal_function successful, response: ';
                // tslint:disable-next-line:no-magic-numbers
                console.log(msg + JSON.stringify(response.data, null, 2));
                this.logger?.log(msg, response);
                cb(null, response.data);
            }
        };
    }

    /**
     * Run a function in one of the 4 Bloomberg panel windows.
     * @param mnemonic The mnemonic of the Bloomberg command to run on a panel
     * @param securities (optional) An array of strings representing one or more securities
     * to pass to the function.
     * @param panel Panel number to run the command on (accepts values "1", "2", "3" or
     * "4")
     * @param tails (optional) parameters passed to the function
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * let mnemonic = "DES";
	 * let securities = ["MSFT US Equity"];
	 * let panel = 3;
	 * let tails = null;
	 * bbg.runBBGCommand(mnemonic, securities, panel, tails, (err, response) => {
	 *     if (!err) {
	 *         console.log(`Ran command "${mnemonic}" on panel ${panel}`);
	 *     } else {
	 *         console.error("Error returned from runBBGCommand", err);
	 *     }
	 * });
	 * ```
     */
    runBBGCommand(
        mnemonic: string,
        securities: string[],
        panel: string,
        tails: string,
        cb: (err: StandardError, response: { status: boolean }) => void,
    ) {
        const message = {
            function: 'RunFunction',
            mnemonic,
            securities,
            tails,
            panel,
        };

        this.queryBloombergBridge(message, cb);
    }

    /**
     * Create a new worksheet with the specified securities and name.
     * @param worksheetName Name for the worksheet.
     * @param securities An array of strings representing one or more securities.
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * let securities = ["TSLA US Equity", "AMZN US Equity"];
	 * bbg.runCreateWorksheet(worksheetName, securities, (err, response) => {
	 *     if (!err) {
	 *         if (response && response.worksheet) {
	 *             //Id assigned to the worksheet
	 *             let worksheetId = response.worksheet.id;
	 *             //List of securities resolved by Bloomberg from the input list, unresolvable securities will be removed
	 *             let workSheetSecurities = response.worksheet.securities;
	 *         } else {
	 *             console.error("invalid response from runCreateWorksheet", response);
	 *         }
	 *     } else {
	 *         console.error("Error returned from runCreateWorksheet", err);
	 *     }
	 * });
	 * ```
     */
    runCreateWorksheet(
        worksheetName: string,
        securities: string[],
        cb: (err: StandardError, response: { status: boolean, worksheet: BBGWorksheet }) => void,
    ) {
        const message = {
            function: 'CreateWorksheet',
            name: worksheetName,
            securities,
        };

        this.queryBloombergBridge(message, cb);
    }


    /**
     * Retrieve all worksheets for the user.
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * bbg.runGetAllWorksheets((err, response) => {
	 *     if (!err) {
	 *         if (response && response.worksheets && Array.isArray(response.worksheets)) {
	 *             response.worksheets.forEach(worksheet => {
	 *                 let worksheetName = worksheet.name;
	 *                 let worksheetId = worksheet.id;
	 *                 ...
	 *             });
	 *         } else {
	 *             console.error("invalid response from runGetAllWorksheets", response);
	 *         }
	 *     } else {
	 *         console.error("Error returned from runGetAllWorksheets", err);
	 *     }
	 * });
	 * ```
     */
    runGetAllWorksheets(
        cb: (
            err: StandardError,
            response: { status: boolean, worksheets: BBGWorksheet[] },
        ) => void,
    ) {
        const message = {
            function: 'GetAllWorksheets',
        };

        this.queryBloombergBridge(message, cb);
    }

    /**
     * Retrieve a specific worksheet by id.
     * @param worksheetId Worksheet ID to retrieve.
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * bbg.runGetWorksheet(worksheetId, (err, response) => {
	 *     if (!err) {
	 *         if (response && response.worksheet && Array.isArray(response.worksheet.securities)) {
	 *             let worksheetName = response.worksheet.name;
	 *             let worksheetId = response.worksheet.id;
	 *             let workSheetSecurities = response.worksheet.securities;
	 *             ...
	 *         } else {
	 *             console.error("invalid response from runGetWorksheet");
	 *         }
	 *     } else {
	 *         console.error("Error returned from runGetWorksheet", err);
	 *     }
	 * });
     * ```
     */
    runGetWorksheet(
        worksheetId: string,
        cb: (err: StandardError, response: { status: boolean, worksheet: BBGWorksheet }) => void,
    ) {
        const message = {
            function: 'GetWorksheet',
            id: worksheetId,
        };

        this.queryBloombergBridge(message, cb);
    }

    /**
     * Replaces a specific worksheet by ID with a new list of securities.
     * @param worksheetId  Worksheet ID to replace.
     * @param securities An array of strings representing one or more securities.
     * @param cb Callback
	 * ```Javascript
	 * let securities = ["TSLA US Equity", "AMZN US Equity"];
	 * bbg.runReplaceWorksheet(worksheetId, securities, (err, response) => {
	 *     if (!err) {
	 *         if (response && response.worksheet) {
	 *             //Details of the updated worksheet will be returned
	 *             let worksheetName = response.worksheet.name;
	 *             //List of securities resolved by Bloomberg from the input list, unresolvable securities will be removed
	 *             let workSheetSecurities = response.worksheet.securities;
	 *             ...
	 *         } else {
	 *             console.error("invalid response from runReplaceWorksheet", response);
	 *         }
	 *     } else {
	 *         console.error("Error returned from runReplaceWorksheet", err);
	 *     }
	 * });
	 * ```
     */
    runReplaceWorksheet(
        worksheetId: string,
        securities: string[],
        cb: (err: StandardError, response: { status: boolean, worksheet: BBGWorksheet }) => void,
    ) {
        const message = {
            function: 'ReplaceWorksheet',
            id: worksheetId,
            securities,
        };

        this.queryBloombergBridge(message, cb);
    }

    /**
     * Gets a list of all available Launchpad component groups.
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * bbg.runGetAllGroups((err, response) => {
	 *     if (!err) {
	 *         if (response && response.groups && Array.isArray(response.groups)) {
	 *             //do something with the returned data
	 *             response.groups.forEach(group => {
	 *                 let groupName = group.name;
	 *                 let groupType = group.type;
	 *                 let groupCurrentValue = group.value;
	 *                 ...
	 *             });
	 *         } else {
	 *             console.error("Invalid response returned from runGetAllGroups", response);
	 *         }
	 *     } else {
	 *         console.error("Error returned from runGetAllGroups", err);
	 *     }
	 * });
	 * ```
     */
    runGetAllGroups(
        cb: (err: StandardError, response: { status: boolean, groups: BBGGroup[] }) => void,
    ) {
        const message = {
            function: 'GetAllGroups',
        };

        this.queryBloombergBridge(message, cb);
    }

    /**
     * Returns details of a Launchpad component group by name.
     * @param groupName The name of the component group to retrieve.
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * bbg.runGetGroupContext(groupName, (err, response) => {
	 *     if (!err) {
	 *         if (response && response.group) {
	 *             let groupName = response.group.name;
	 *             let groupType = group.type;
	 *             let groupCurrentValue = group.value;
	 *             ...
	 *         } else {
	 *             console.error("Invalid response returned from runGetGroupContext", response);
	 *         }
	 *     } else {
	 *         console.error("Error returned from runGetGroupContext", err);
	 *     }
	 * });
	 * ```
     */
    runGetGroupContext(
        groupName: string,
        cb: (err: StandardError, response: { status: boolean, group: BBGGroup }) => void,
    ) {
        const message = {
            function: 'GetGroupContext',
            name: groupName,
        };

        this.queryBloombergBridge(message, cb);
    }

    /**
     * Set the context value of a Launchpad group by name.
     * @param groupName The name of the component group to set the value of.
     * @param value The value to set for hte group, this will usually be a string
     * representing a security.
     * @param cookie (optional) Cookie value identifying a particular component within
     * a group to set the context of. Pass null if not required.
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * bbg.runSetGroupContext(groupName, newValue, null, (err, response) => {
	 *     if (!err) {
	 * 	       // You may wish to retrieve the current state of Launchpad group here as Bloomberg
	 *         // will resolve any security your set and may therefore its value may differ from
	 *         // what you sent.
	 *         bbg.runGetGroupContext(groupName, (err2, response2) => { ... });
	 *     } else {
	 *         console.error("Error returned from runSetGroupContext", err);
	 *     }
	 * });
	 * ```
     */
    runSetGroupContext(
        groupName: string,
        value: string,
        cookie: string | null,
        cb: (err: StandardError, response: { status: boolean }) => void,
    ) {
        const message: {function: string, name: string, value: string, cookie?: string} = {
            function: 'SetGroupContext',
            name: groupName,
            value,
        };

        if (cookie) {
            message.cookie = cookie;
        }

        this.queryBloombergBridge(message, cb);
    }

    /**
     * Search for Bloomberg securities via the Bloomberg Bridge and BLP API, which will return
	 * results in around ~120-150ms and maybe used, for example, to power an autocomplete or
	 * typeahead search.
     * @param security The string to lookup a security for
     * @param cb Callback
	 * @example
	 * ```Javascript
	 * bbg.runSecurityLookup(security, (err, response) => {
	 *     if (!err) {
	 * 	       if (response && response.results) {
	 *             //do something with the results
	 *             response.results.forEach(result => {
	 *                 console.log(result.name + " " + result.type);
	 *                 ...
	 *             });
	 * 	       } else {
	 *             console.error("invalid response from runSecurityLookup", response);
	 * 	       }
	 *     } else {
	 * 	       console.error("Error returned from runSecurityLookup", err);
	 *     }
	 * });
	 * ```
     */
    runSecurityLookup(
        security: string,
        cb: (err: StandardError,
            response: { status: boolean, results: [{name: string, type: string}] }) => void,
    ) {
        const message: { function: string, security: string } = {
            function: 'SecurityLookup',
            security,
        };

        this.queryBloombergBridge(message, cb);
    }
}

/**
 * Automated setup function enabling use as preload on a Finsemble component.
 */
const setupBloombergBridgeClient = () => {
    console.log("Setting up BloombergBridgeClient");
	(FSBL as any).Clients.BloombergBridgeClient = new BloombergBridgeClient((FSBL as any).Clients.Router, (FSBL as any).Clients.Logger);
	window.dispatchEvent(new Event('BloombergBridgeClientReady'));
};

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if ((window as any).FSBL && (FSBL as any).addEventListener) {
    (FSBL as any).addEventListener("onReady", setupBloombergBridgeClient);
} else {
    window.addEventListener("FSBLReady", setupBloombergBridgeClient);
}
