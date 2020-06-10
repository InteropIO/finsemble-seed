import { _BaseClient } from "./baseClient";
/**
 *
 * @introduction
 * <h2>Distributed Store Client</h2>
 * The Distributed Store Client handles creating, retrieving, and destroying stores. Stores are used to save and retrieve data either locally or globally.
 * This data is not persisted. You can add listeners at multiple levels (store or field), and get the updated data as it's updated in the store.
 * Fields are stored within the store as key/value pair. For more information, see the <a href="tutorial-DistributedStore.html">Distributed Store tutorial</a>.
 *

 * @hideconstructor
 * @constructor
 */
export declare class DistributedStoreClient extends _BaseClient {
    ls: any;
    constructor(params: any);
    /**
     * Get a store. If no store is set, you will get the global Finsemble store. If global is not set, Finsemble will check local first then check global.
     * @param {String} params.store The name of the store.
     * @param {boolean} params.global Whether a store is accessible outside of the component it's created in.
     * @param {function} cb -  Will return the value if found.
     * @returns {StoreModel} - returns the store
     * @example
     * FSBL.Clients.DistributedStoreClient.getStore({
     * 	store:'store1'
     * },
     * function(error, storeObject){});
     */
    getStore(params: {
        store?: string;
        global?: boolean;
    }, cb: any): any;
    /**
     *Creates a store.
     * @param {string} params.store The name of the store.
     * @param {any} params.values Starting values for the store.
     * @param {boolean} params.global Whether a store is accessible outside of the component it's created in.
     * @param {boolean} params.persist Whether to persist the values of the store to storage. The store must be global to use this flag.
     * @param {function} cb  Will return the store on success.
     * @returns {function} Callback will receive the store
     * @example
     * FSBL.Clients.DistributedStoreClient.createStore({
     * 	store:"store1",
     * 	global:false,
     * 	values:{}
     * },
     * function(error, storeObject){});
     */
    createStore(params: {
        store: string;
        global?: boolean;
        persist?: boolean;
        values?: any;
    }, cb?: Function): Promise<{
        err: any;
        data: any;
    }>;
    /**
     * Remove a store. If global is not set and a local store isn't found, Finsemble will remove the global store.
     * @param {String} params.store The name of the store.
     * @param {boolean} params.global Whether the store you're trying to remove is a global store.
     * @param {function} cb Callback to be invoked when the store is removed.
     * @example
     * FSBL.Clients.DistributedStoreClient.removeStore({
     * 	store:"store1",
     * 	global:true
     * },
     * function(){});
     */
    removeStore(params: {
        store: string;
        global?: boolean;
    }, cb: any): any;
    /**
     * @private
     */
    load: (cb: any) => void;
}
declare var storeClient: DistributedStoreClient;
export default storeClient;
