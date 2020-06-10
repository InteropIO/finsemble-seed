import { ICentralLogger } from "./ICentralLogger";
export declare type BaseClientParams = {
    /** A function to be called after the client has initialized. */
    onReady?: (cb: any) => void;
    /** The name of the client. Must be unique. */
    name: string;
    /** @TODO - add enumerations for all clients and services. */
    /** The clients that must be online before this client comes online. */
    requiredClients?: any[];
    /** The services that must be online before this client comes online. */
    requiredServices?: any[];
    startupDependencies?: {
        services?: string[];
        clients?: string[];
    };
};
/**
 * @introduction
 * <h2>Base Client</h2>
 * The Base Client is inherited by every client to provide common functionality to the clients. Clients communicate their status to each other through the Router and receive service status from the service manager. Once all dependencies are met, either client or service, the client's `onReady` method is fired.
 *
 * We're currently halfway through migrating our clients from extending a normal function prototype to an ES6 class.
 * "_BaseClient" represents the new class, while "BaseClient" is the original function. When the migration is complete,
 * we will remove the old function and rename "_BaseClient" to "BaseClient".
 * @constructor
 * @param {Object} params
 * @param {Function} params.onReady - A function to be called after the client has initialized.
 * @param {String} params.name - The name of the client
 * @shouldBePublished false
    @example
    import { _BaseClient as BaseClient } from "./baseClient";
    var NewClient = function (params) {
        BaseClient.call(this, params);
        var self = this;

        return this;
    };

    var clientInstance = new NewClient({
        onReady: function (cb) {
            Logger.system.log("NewClient Online");
            cb();
        },
        name:"NewClient"
    });
    clientInstance.requiredServices = [REPLACE_THIS_ARRAY_WITH_DEPENENCIES];
    clientInstance.initialize();
    module.exports = clientInstance;
    @private
 */
export declare class _BaseClient {
    /** The current status of this service. */
    status: "offline" | "online";
    /** The callback called when this service is ready. */
    private _onReady;
    startupTime: number;
    initialized: boolean;
    startupDependencies: {
        services?: any[];
        clients?: any[];
    };
    /** Reference to the RouterClient. */
    routerClient: any;
    /** Gets the current openfin window - stays here for backward compatibility. */
    finWindow: {
        name: string;
        uuid: string;
    };
    /** Gets the current window. */
    finsembleWindow: any;
    /** Gets the current window name. */
    windowName: string;
    /** Services that must be online before the client can come online. */
    requiredServices: any[];
    /** Clients that must be online before the client may come online.*/
    requiredClients: any[];
    /** Queue of functions to process once the client goes online. */
    clientReadyQueue: (() => void)[];
    /** A unique name for the client.*/
    name: string;
    logger: ICentralLogger;
    constructor(params: BaseClientParams);
    /**
     * @private
     *
     */
    processClientReadyQueue: () => void;
    /**
     * @private
     *
     */
    onReady: (cb: any) => void;
    /** Check to see if the client can come online. We check this against the required services and clients */
    /**
 * @private
 *
 */
    setClientOnline: () => void;
    /**
     * @private
     *
     */
    initialize: (cb?: Function) => void;
    /**
     * @private
     *
     */
    onClose: (cb?: any) => void;
}
/**
 * @introduction
 * <h2>Base Client</h2>
 * The Base Client is inherited by every client to provide common functionality to the clients. Clients communicate their status to each other through the Router and receive service status from the service manager. Once all dependencies are met, either client or service, the client's `onReady` method is fired.
 * @constructor
 * @param {Object} params
 * @param {Function} params.onReady - A function to be called after the client has initialized.
 * @param {String} params.name - The name of the client
 * @shouldBePublished false
    @example
    import { _BaseClient as BaseClient } from "./baseClient";
    var NewClient = function (params) {
        BaseClient.call(this, params);
        var self = this;

        return this;
    };

    var clientInstance = new NewClient({
        onReady: function (cb) {
            Logger.system.log("NewClient Online");
            cb();
        },
        name:"NewClient"
    });
    clientInstance.requiredServices = [REPLACE_THIS_ARRAY_WITH_DEPENENCIES];
    clientInstance.initialize();
    module.exports = clientInstance;
    @private
 */
declare var BaseClient: (params: any) => void;
export default BaseClient;
