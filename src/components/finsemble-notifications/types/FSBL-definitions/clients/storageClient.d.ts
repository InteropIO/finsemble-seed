/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { _BaseClient } from "./baseClient";
import { componentMutateParams } from '../services/window/WindowAbstractions/BaseWindow';
import { StandardCallback } from "../globals";
/**
 *
 * @introduction
 * <h2>Storage Client</h2>
 *
 * The Storage Client handles saving and retrieving data for your smart desktop.
 *
 *
 *See the <a href=tutorial-storingData.html>Storing Data tutorial</a> for an overview of using the Storage Client.
 * @hideconstructor
 *  @todo add clear method
 * @constructor
 */
export declare class StorageClient extends _BaseClient {
    /**
     * Define the user name for storage (i.e., each user has unique storage).
     * @param {Object} params
     * @param {String} params.user The user name defined for storage.
     * @param {StandardCallback} cb Callback to be called on success.
     *
     * @example
     * FSBL.Clients.StorageClient.setUser({ user: "JohnDeere"});
     */
    setUser(params: {
        user: string;
    }, cb?: StandardCallback): void;
    /**
     * Specifies the data store. For normal operation this function doesn't have to be invoked -- the default data store is set in configuration.
     * @param {Object} params
     * @param {String} params.topic If specified then data store is set only for topic.
     * @param {string} params.dataStore Identifies the data store (e.g. "localStorage", "redis").
     * @param {function} cb Callback to be called on success.
     *
     * @example
     * FSBL.Clients.StorageClient.setStore({topic:"finsemble", dataStore:"redis"})
     */
    setStore(params: {
        topic: string;
        dataStore?: string;
    }, cb?: StandardCallback): void;
    /**
     * Save a key value pair into storage.
     * @param {Object} params
     * @param {String} params.topic Storage topic for key being stored.
     * @param {String} params.key The key to be stored.
     * @param {any} params.value The value to be stored.
     * @param {function} cb Callback to be called on success.
     *
     * @example
     * FSBL.Clients.StorageClient.save({topic:"finsemble", key:"testKey", value:"testValue"})
     */
    save(params: componentMutateParams, cb?: StandardCallback): Promise<{}>;
    /**
     *
     * @param params
     * @private
     */
    save1(params: {
        key: string;
        topic: string;
        value: any;
    }): Promise<{}>;
    /**
     * Get a value from storage.
     * @param {Object} params
     * @param {String} params.key The key to get from storage.
     * @param {String} params.topic The topic that the data is saved under.
     * @param {function} cb Callback to be called on success.
     *
     * @example
     * FSBL.Clients.StorageClient.get({ topic:"finsemble", key:"testKey" }, function(err, data) {
     *	var myData = data;
     * });
     */
    get<T = any>(params: {
        key: string;
        topic: string;
    }, cb?: StandardCallback<string | Error, T>): Promise<T>;
    /**
     *
     * @param params
     * @param cb
     * @private
     */
    get1<T = any>(params: {
        key: string;
        topic: string;
    }, cb?: StandardCallback<string | Error, T>): Promise<T>;
    /**
     * Asynchronously updates provided key in storage by first retrieving the key
     * then running a provided function on the result and re-saving its value.
     * There’s no guarantees of consistency or atomicity
     *
     * @param params {any} Update storage params
     * @param params.topic {string} The storage topic
     * @param params.key {string} The storage key
     * @param params.updateFn {Function} Function to run to determine the value to store
     * @private
     */
    updateStorage(params: {
        topic: string;
        key: string;
        updateFn: (x: any) => any;
    }): Promise<{}>;
    /**
     *
     * @param params
     * @private
     */
    updateStorage1(params: {
        topic: string;
        key: string;
        updateFn: (x: any) => any;
    }): Promise<{}>;
    /**
     * Get all keys for the topic.
     * @param {Object} params
     * @param {String} params.topic Topic for the keys to return.
     * @param {String=} params.keyPrefix Filter all keys that don't start with this prefix.
     * @param {function} cb Callback to be called on success.
     *
     * @example
     * FSBL.Clients.StorageClient.keys({topic:"finsemble", keyPrefix:"test"}, function(err, data){
     *	var myKeys = data;
     * });
     */
    keys(params: {
        topic: string;
        keyPrefix?: string;
    }, cb?: StandardCallback): void;
    /**
     *
     * @param params
     * @private
     */
    keys1(params: {
        topic: string;
        keyPrefix?: string;
    }): Promise<string[]>;
    /**
     * Get a multiple values from storage based on regex.(coming soon)
     * @param {Object} params
     * @param {function} cb Callback to be called on success.
     * @private
     * @todo make this work.
     * @example
     * StorageClient.get({key:"testKey"});
     */
    getMultiple(params: any, cb?: StandardCallback): void;
    /**
     * Delete a value from storage.
     * @param {Object} params
     * @param {String} params.key The key to get from storage.
     * @param {String} params.topic The topic that the data is saved under.
     * @example
     * FSBL.Clients.StorageClient.remove({ key:"testKey" })
     */
    remove(params: {
        key: string;
        topic: string;
    }, cb?: StandardCallback): Promise<{}>;
    /**
     *
     * @param params
     * @private
     */
    remove1(params: {
        key: string;
        topic: string;
    }): Promise<{}>;
    delete: (params: {
        key: string;
        topic: string;
    }, cb?: StandardCallback<string | Error | import("../../../../../../../Users/CWatson/CIQDev/_FINSEMBLE/finsemble/src/globals").CallbackError, any>) => Promise<{}>;
    /**
     * Clears a storage adapter of all data.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     *
     */
    clearCache(cb?: StandardCallback): void;
}
declare var storageClient: StorageClient;
export default storageClient;
