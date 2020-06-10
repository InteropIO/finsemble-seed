/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
declare type fieldOnlyParam = {
    /** Name of the field */
    field: string;
};
declare type fieldAndValueParam = {
    /** Name of the field */
    field: string;
    /** Value of the field */
    value?: any;
};
declare type fieldAndValueParams = fieldAndValueParam[] | string[];
declare type listenerParam = {
    /**
     * The data field to listen for.
    */
    field?: string;
    /**
     * The function to be called when the observed piece of config is modified. If this is empty, fn is used.
     */
    listener?: Function;
};
declare type removeListenersType = listenerParam | listenerParam[];
import { _BaseClient as BaseClient } from "./baseClient";
import { StandardCallback } from "../globals";
/**
 * @introduction
 * <h2>Config Client</h2>
 *
 * This client provides run-time access to Finsemble's configuration.
 * The Config Client functions similar to a global store created with the Distributed Store Client and offers many of the same methods.
 * Values modified at runtime are not persisted.
 *
 *
 * See the [Configuration tutorial](tutorial-Configuration.html) for a configuration overview.
 *
 * @hideconstructor
 * @constructor
 */
export declare class ConfigClient extends BaseClient {
    listeners: any[];
    subs: any;
    constructor(params: any);
    /**
     * Get a value from the config.
     * @param {Function} cb Will return the value if found.
     * @returns {any} The value of the field. If no callback is given and the value is local, this will run synchronous
     * @example
     * FSBL.Clients.ConfigClient.getValue({ field:'field1' }, function(err,value){ });
     * FSBL.Clients.ConfigClient.getValue('field1', function(err,value){ });
     */
    getValue(params: fieldOnlyParam | string, cb?: Function): Promise<any>;
    /**
     * Get multiple values from the config.
    * @param {fieldOnlyParam[] | string[]} fields An array of field objects. If there are no fields provided, the complete configuration manifest is returned.
     * @param {Function} cb Will return the value if found.
     * @returns {Object} - Returns an object of with the fields as keys. If no callback is given and the value is local, this will run synchronous
     * @example
     * FSBL.Clients.ConfigClient.getValues([{ field: 'field1' },{ field2: 'field2' }],function(err,values){ });
     * FSBL.Clients.ConfigClient.getValues(['field1','field2'], function(err,values){ });
     * FSBL.Clients.ConfigClient.get(null, callback); // returns the complete manifest containing the finsemble property
    */
    getValues(fields?: fieldOnlyParam[] | string[], cb?: Function): Promise<any>;
    /**
     * Set a value in the config. Setting a value will trigger events that you can listen to using <a href="ConfigClient.html#addListener">addListener</a>.
     * @param {function} cb Optional callback
     * @returns {null}
     *
     * @example
     * FSBL.Clients.ConfigClient.setValue({ field:'field1', value:"new value" });
     */
    setValue(params: fieldAndValueParam, cb?: any): any;
    /**
     * This will set multiple values in the config.
     * @param {function} cb Optional callback
     * @returns {null}
     *
     * @example
     * FSBL.Clients.ConfigClient.setValues([{ field:'field1', value: "new value" }]);
     */
    setValues(fields: fieldAndValueParams, cb?: any): any;
    /**
     * Remove a value from the config.
     * @param {fieldAndValueParam | String} params - Either an object or string
     * @param {Function} cb -  Returns an error if there is one
     * @example
     * FSBL.Clients.ConfigClient.removeValue({ field:'field1' }, function(err,bool){ });
     */
    removeValue(params: fieldAndValueParam, cb?: Function): any;
    /**
     * Removes multiple values from the config.
     * @param {fieldAndValueParams} params - An Array of field objects
     * @param {Function} cb -  Returns an error if there is one.
     * @example
     * FSBL.Clients.ConfigClient.removeValues([{
     * 	field:'field1'
     * }],
     * function(err,bool){	});
     */
    removeValues(params: fieldAndValueParams, cb?: Function): any;
    /**
     * make sure we dont have duplicate router subscribers
     * @private
     */
    changeSub: (change: any) => void;
    /**
    * Add a listener to the config at either the root config level or field level. If no field is given, the root config level is used. You can also listen for changes to config fields any number of levels deep -- finsemble.configitem.deeperconfigitem.evendeeperconfigitem
    * @param {Function} fn The function to be called when the observed piece of config is modified.
    * @param {Function} cb Callback to be invoked after the listener is added.
    * @example
    * var myFunction = function(err,data){};
    * FSBL.Clients.ConfigClient.addListener({ field:'field1' }, myFunction, cb);
    */
    addListener(params: fieldOnlyParam, fn: any, cb?: any): any;
    /**
     *
    * Add an array of listeners as objects or strings. If using strings, you must provide a function callback as the second parameter.
    * @param {function} fn The function to be called when the observed piece of config is modified.
    * @param {function} cb Callback to be invoked after the listeners are added.
    * @example
    * var myFunction = function(err,data){}
  * FSBL.Clients.ConfigClient.addListeners(
    * 	[
    * 		{ field: "field1", listener: myFunction },
    * 		{ field: "field2", listener: myFunction }
    * 	],
    * 	null,
    * 	cb
    * );
    *
    * FSBL.Clients.ConfigClient.addListeners(
    * [{ field: "field1" }, { field: "field2", listener: myFunction }],
    * myFunction,
    * cb
    * );
    *
    * FSBL.Clients.ConfigClient.addListeners(["field1", "field2"], myFunction, cb);
    */
    addListeners(params: listenerParam | listenerParam[], fn?: Function, cb?: Function): any;
    /**
     * Remove a listener from config. If no field is given, we look for a config root listener
     * @param {function} fn The listener to remove.
     * @param {function} cb Returns true if it was successful in removing the listener.
     *
     * @example
     * var myFunction = function(err,data){ }
     * FSBL.Clients.ConfigClient.removeListener({
     * 	field:'field1'
     * }, MyFunction, function(bool){ });
     * FSBL.Clients.ConfigClient.removeListener(MyFunction, function(bool){ });
     */
    removeListener(params: fieldOnlyParam, fn: Function, cb?: Function): any;
    /**
     * Remove an array of listeners from the config
     * @param {removeListenersType} params
     * @param {function} fn The listener to remove
     * @param {function} cb Returns true if it was successful in removing the listener.
     *
     * @example
     * var myFunction = function(err,data){ }
     * FSBL.Clients.ConfigClient.removeListeners({
     * 	field: 'field1'
     * }, MyFunction, function(bool){ });
     * FSBL.Clients.ConfigClient.removeListeners([{ field:'field1', listener: MyFunction }], function(bool){ });
     * FSBL.Clients.ConfigClient.removeListeners(['field1'], MyFunction, function(bool) { });
     */
    removeListeners(params: removeListenersType, fn?: Function, cb?: Function): any;
    /**
     * @private
     * @memberof ConfigClient
     */
    handleChanges: (err: any, response: any) => void;
    /**
     * @private
     * @memberof ConfigClient
     */
    triggerListeners: (listenerKey: any, data: any) => void;
    /**
     * Get all or a portion of the configuration from the Config Service. Typically this function is used to return Finsemble configuration
     * (e.g. "finesemble.components"); however, if can also return all or part of the manifest which contains the Finsemble config property.
     * If no configReference parameter is passed in (i.e. only the callback parameter is specified), then the complete manifest object is returned
     * (including manifest.finsemble).
     *
     * @param {object=} params field property identifies specific config to return
     * @param {function} callback callback function(error, data) to get the configuration data
     * @private
     * @example
     *
     * FSBL.Clients.ConfigClient.get({ field: "finsemble" }, function(err, finsemble) {
     *		if (!err) {
     *			finsembleConfig = finsemble;
     *		} else {
     *			console.error("failed to get finsemble configuration");
     *		}
     * });
     *
     * FSBL.Clients.ConfigClient.get({ field: "finsemble.isAuthEnabled" }, function(err, isAuthEnabled) {
     *		var authorizationOn = isAuthEnabled;
     * });
     *
     * FSBL.Clients.ConfigClient.get(callback); // returns the complete manifest containing the finsemble property
     * FSBL.Clients.ConfigClient.get(null, callback); // alternate form; returns the complete manifest containing the finsemble property
     * FSBL.Clients.ConfigClient.get({}, callback); // alternate form; returns the complete manifest containing the finsemble property
     * FSBL.Clients.ConfigClient.get({ field: "finsemble.components" }, callback);
     * FSBL.Clients.ConfigClient.get({ field: "finsemble.services" }, callback);
     * FSBL.Clients.ConfigClient.get({ field: "finsemble.components" }, callback);
     * FSBL.Clients.ConfigClient.get({ field: "finsemble.assimilation" }, callback);
     * FSBL.Clients.ConfigClient.get({ field: "runtime.version", callback) }; // returns the manifest's runtime.version property
     */
    get(params: fieldOnlyParam | {}, callback: any): void;
    /**
     * This is designed to mirror the get. Private because security TBD.
     * @private
     *
     * @param {object} params
     * @param {function} callback
     */
    set: (params: {} | fieldAndValueParam, callback: any) => void;
    /**
     * Dynamically set config values within the Finsemble configuration.  New config properties may be set or existing ones modified. Note that configuration changes will not necessarily dynamically modify the components or services that use the corresponding configuration -- it depends if the component or service handles the corresponding change notifications (either though PubSub or the Config's DataStore). Also, these changes do not persist in any config files.
     *
     * <b>Note</b>: Anytime config is set using this API, the newConfig along with the updated manifest will by published to the PubSub topic "Config.changeNotification".  To get these notifications any component or service can subscribe to the topic. An example is shown below.
     *
     * <b>Note</b>: Anytime config is set using this API, the dataStore underlying configuration 'Finsemble-Configuration-Store' will also be updated. To get these dataStore events a listener can be set as shown in the example below. However, any config modifications made directly though the DataStore will not result in corresponding PubSub notifications.
     *
     * @param {object} params
     * @param {object} params.newConfig Provides the configuration properties to add into the existing configuration under manifest.finsemble. This config must match the Finsemble config requirements as described in the [Configuration tutorial]{@tutorial Configuration}. It can include importConfig references to dynamically fetch additional configuration files.
     * @param {boolean} params.overwrite If true then overwrite any preexisting config with new config (can only set to true when running from same origin, not cross-domain); if false then newConfig must not match properties of existing config, including service and component configuration.
     * @param {boolean} params.replace True specifies any component or service definitions in the new config will place all existing non-system component and service configuration
     * @param {StandardCallback} callback Callback to be invoked upon task completion.
     * @example
     * // Examples using processAndSet()
     * FSBL.Clients.ConfigClient.processAndSet({ newConfig: { myNewConfigField: 12345 }, overwrite: false });
     * FSBL.Clients.ConfigClient.processAndSet(
     * {
     *	newConfig: {
     *		"myNewConfigField": 12345,
     *		"myNewConfigObject": {
     *			A: "this is a test",
     *			B: "more test"
     *		},
     *		"importConfig": [
     *			"$applicationRoot/configs/application/test.json",
     *		]
     *	},
     *	overwrite: true,
     *  replace: false,
     * },
     *	function (err, finsemble) {
     *		if (err) {
     *			console.error("ConfigClient.set", err);
     *		} else {
     *			console.log("new finsemble config", finsemble);
     *		}
     *	}
     * );
     *
     *  // example subscribing to PubSub to get notifications of dynamic updates
     * RouterClient.subscribe("Config.changeNotification", function (err, notify) {
     *		console.log("set notification", notify.data.newConfig, notify.data.finsemble);
     *	});
     *
     *  // example using DataStore to get notifications of dynamic updates
     * DistributedStoreClient.getStore({ store: 'Finsemble-Configuration-Store', global: true }, function (err, configStore) {
     *		configStore.addListener({ field: "finsemble" }, function (err, newFinsembleConfig) {
     *			console.log("new manifest.finsemble configuration", newFinsembleConfig);
     *		});
     * });
     *
     */
    processAndSet(params: {
        newConfig: any;
        overwrite: boolean;
        replace: boolean;
    }, callback?: StandardCallback): void;
    /**
     * Sets a value on the configStore and persists that value to storage. On application restart, this value will overwrite any application defaults.
     * @param {fieldAndValueParam} params
     * @param {StandardCallback} callback Callback to be invoked when callback to be invoked when preferences have been retrieved from the service.
     * @example
     * FSBL.Clients.ConfigClient.setPreference({
     * 	field: "finsemble.initialWorkspace",
     * 	value: "Workspace 2"
     * }, (err, response) => {
     * 		//preference has been set
     * });
     */
    setPreference(params: fieldAndValueParam, callback?: StandardCallback): void;
    /**
     * Retrieves all of the preferences set for the application.
     * @param {Object} params Parameters to pass to getPreferences. Optional. Defaults to null and currently ignored.
     * @param {StandardCallback} callback Callback to be invoked when preferences have been retrieved from the service.
     * @example
     * FSBL.Clients.ConfigClient.getPreferences((err, preferences)=> {
     * 		//use preferences.
     * });
     */
    getPreferences(params?: any, callback?: StandardCallback): void;
}
declare var configClient: ConfigClient;
export default configClient;
