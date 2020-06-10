import { _BaseClient } from "./baseClient";
import { StandardCallback } from "../globals";
/**
 *
 * @introduction
 * <h2>Store Model</h2>
 * The Store Model consists of store instances. It handles getters/setters of data.
 * @hideConstructor
 * @class
 */
declare type setValuesParam = {
    /** The name of the field where data will be stored */
    field: string;
    /** Value to be stored */
    value: any;
};
declare class StoreModel extends _BaseClient {
    routerClient: any;
    isGlobal: boolean;
    values: {};
    listeners: any[];
    lst: any;
    registeredDispatchListeners: any[];
    mapping: {};
    subs: any;
    constructor(params: any, routerClient: any);
    /** This is the Flux dispatcher. It can be used dispatch actions across stores. These action are not caught inside of the global store service. For more information, you can read the [Flux documentation](https://facebook.github.io/flux/docs/overview.html).
     *
     * Example:
     * ```
     * store.Dispatcher.register(function(action){
     * 	if(action.actionType === "ACTION1") {
     * 		// Do something with the action here.
     * 	}
     * })
     * ```
     */
    Dispatcher: {
        register: (fn: any) => void;
        dispatch: (data: any) => void;
    };
    /**
     * @param {*} err
     * @param {*} message
     * @private
     */
    handleDispatchedMessages(err: any, message: {
        data: any;
    }): void;
    /**
     * Set a value in the store. Two events will be triggered with topics of: store and field.
     * @param {String} params.field The name of the field where data will be stored
     * @param {String} params.value Value to be stored
     * @param {function} cb callback
     * @returns {null}
     *
     * @example
     * store.setValue({ field:'field1', value:"new value" });
     */
    setValue(params: {
        field: string;
        value: any;
    }, cb: StandardCallback): any;
    /**
     * Handles changes to the store. Will publish from the field that was changed and back.
     */
    private publishObjectUpdates;
    /**
     * Send items that are no longer mapped or had their map change. If a value is remapped we'll send out the new value.
    */
    private sendRemovals;
    /**
     * This will set multiple values in the store.
     * @param {function} cb callback
     * @param {Array<setValuesParam>} fields An array where each element is like the object below.
     * @example
     * store.setValues([{ field:'field1', value:"new value" }]);
     */
    setValues(fields: setValuesParam[], cb?: StandardCallback): any;
    /**
     * Get a value from the store. If global is not set, we'll check local first then we'll check global. Returns the value of the field. If no callback is given and the value is local, this will run synchronously.
     * @param {String} params.field The field where the value is stored.
     * @param {StandardCallback} cb Will return the value if found.
     * @returns {any} The value of the field. If no callback is given and the value is local, this will run synchronous
     * @example
     * store.getValue({ field: 'field1' }, function(err,value){});
     * store.getValue('field1', function(err,value){});
     */
    getValue(params: {
        field: string;
    } | string, cb?: StandardCallback): any;
    /**
     * Get multiple values from the store. Returns an object of with the fields as keys.If no callback is given and the value is local, this will run synchronously. Returns an object of with the fields as keys.If no callback is given and the value is local, this will run synchronous
     * @param {Array.<object>|Array.<String>} fields An Array of field objects. If there are no fields provided, all values in the store are returned.
     * @param {string} fields.field The field where the value is stored.
     * @param {Function} [cb] Will return the value if found.
     * @returns {Object} - returns an object of with the fields as keys.If no callback is given and the value is local, this will run synchronous
     * @example
     * store.getValues([{ field:'field1' }, { field:'field2' }], function(err,values){});
     * store.getValues(['field1', 'field2'], function(err,values){});
     */
    getValues(fields: {
        field: string;
    }[] | string[], cb: any): {
        [k: string]: any;
    } | void;
    /**
     * Get a single value from the global store.
     */
    private getGlobalValue;
    /**
     * Get values from the global store.
     */
    private getGlobalValues;
    /**
     * Remove a value from the store.
    * @param {Object | String} params - Either an object (`{ field: string }`) or string
     * @param {String} param.field The name of the field
     * @param {Function} cb returns an error if there is one
     * @todo this function needs some help. The first should be 'if(typeof params === "string");.
     * @example
     * store.removeValue({ field: 'field1' }, function(err,bool){});
     */
    removeValue(params: any, cb: any): any;
    /**
     * Removes multiple values from the store.
     * @param {Object[] | String[]} params - An Array of field objects
     * @param {String} params.field - The name of the field
     * @param {Function} cb -  returns an error if there is one.
     * @example
     * store.removeValues([{ field: 'field1' }], function(err,bool){});
     */
    removeValues(params: string[] | {
        field: string;
    }[], cb: any): any;
    /**
     * Destroys the store.
     * @param {Function} cb Function to be invoked after the store is destroyed.
     * @example
     * store.destroy();
     */
    destroy(cb: any): void;
    /**
     * NOTE: make sure we dont have duplicate router subscribers
     * @private
     */
    changeSub(change: any): void;
    /**
    * Add a listener to the store at either the store or field level. If no field is given, the store level is used. You can also listen to nested object (e.g., field1.nestedField).
      * @param {String} params.field The piece of data that you want to listen on. If this is empty it listens to all changes of the store.
    * @param {Function} fn the function to call when the data changes
    * @param {Function} cb callback to be invoked
    * @example
    * var myFunction = function(err,data) {
    * }
    * store.addListener({ field:'field1' }, myFunction, cb);
    */
    addListener(params: {
        field?: string;
    }, fn: any, cb: any): any;
    /**
    * Add an array of listeners as  objects or strings. If using strings, you must provide a function callback.
    * @param {String} params.field The piece of data that you want listen on. If this is empty it listen to all changes of the store.
    * @param {String} params.listener The function to call when the piece of data is modified. If this is empty, fn is used.
    * @param {function} fn The function to call when the piece of data is modified.
    * @param {function} cb callback to be invoked when the listeners are added.
    * @example
    * var myFunction = function(err,data){
    * }
    * store.addListeners([{
    * 	field: 'field1',
    * 	listener: myFunction
    * },
    * {
    * 	field:'field2',
    * 	listener: myFunction
    * }],
    * null, cb);
    * store.addListeners([{ field: 'field1' },{ field: 'field2', listener: myFunction }], myFunction, cb);
    * store.addListeners(['field1','field2'], myFunction, cb);
    */
    addListeners(params: {
        field: string;
        listener?: Function;
    } | {
        field: string;
        listener?: Function;
    }[] | string[], fn?: any, cb?: any): any;
    /**
     * Remove a listener from store. If no field is given, we look for a store listener
     * @param {String} params.field - The data field with the listener that you want to remove.
     * @param {function} fn The handler passed into `addListener` or `addListeners`.
     * @param {function} cb returns true if it was successful in removing the listener.
     *
     * @example
     * var myFunction = function(err,data){}
     * store.removeListener({ field: 'field1' }, MyFunction, function(bool){});
     * store.removeListener(MyFunction, function(bool){});
     */
    removeListener(params?: {
        field?: string;
    }, fn?: any, cb?: any): any;
    /**
     * Remove an array of listeners from the store
     * @param {String} params.field The data field with the listener that you want to remove.
     * @param {String} params.listener The handler passed into `addListener` or `addListeners`.
     * @param {function} fn The handler passed into `addListener` or `addListeners`.
     * @param {function} cb returns true if it was successful in removing the listener.
     *
     * @example
     * var myFunction = function(err,data){}
     * store.removeListeners({ field: 'field1' }, MyFunction, function(bool){});
     * store.removeListeners([{ field: 'field1', listener: MyFunction}], function(bool){});
     * store.removeListeners(['field1'], MyFunction, function(bool){});
     */
    removeListeners(params: any, fn: any, cb?: any): any;
    /**
     * Handles all changes coming in from the service.
     */
    private handleChanges;
    private triggerListeners;
}
export default StoreModel;
