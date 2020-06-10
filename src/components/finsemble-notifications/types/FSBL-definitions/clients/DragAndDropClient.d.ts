import { _BaseClient as BaseClient } from "./baseClient";
import { StandardCallback } from "../globals";
declare type receiver = {
    type: string;
    handler: Function;
};
declare type receiverUpdate = {
    type: string;
    handler: Function;
    oldHandler: Function;
};
declare type emitter = {
    type: string;
    data: any;
};
/**
 *
 * @introduction
 * <h2>Drag and Drop Client</h2>
 *
 * The Drag and Drop Client acts as an API to share data between components via a user action i.e., drag and drop.
 * As an example, consider a user wanting to share a chart inside a chat - they can do so using the Drag and Drop Service.
 *
 *
 * A component that shares data needs to publish the data types it can share by calling `setEmitters`.
 * The Window Manager automatically adds a draggable share icon to any component that calls `setEmitters`.
 * Similarly, a component that can receive data needs to publish that using `addReceivers`.
 * Since it is possible to have multiple components on a page receiving the data, you can add multiple receivers for the same data `type`.
 *
 * The Drag and Drop Client overlays a scrim on all windows once the user starts dragging a sharable item. The scrim displays which windows can and cannot receive that data.
 * However, this doesn't always work well, especially with complex third party components. You may need to add your own drop zone to the component and use `drop` as the handler.
 *
 * The Drag and Drop Client can also make use of the Linker Client to share data between linked windows using `openSharedData`.
 *
 * For more information, see the [Drag and Drop tutorial](tutorial-DragAndDropSharing.html).
 *
 * @hideconstructor
 * @constructor
 */
export declare class DragAndDropClient extends BaseClient {
    emitters: {
        [x: string]: any;
    };
    receivers: {
        [x: string]: any;
    };
    receiveResponder: boolean;
    linkerListener: boolean;
    openLinkerDataByDefault: boolean;
    SHARE_METHOD: {
        DROP: string;
        SPAWN: string;
        LINKER: string;
    };
    store: any;
    constructor(params: any);
    /**
     * @private */
    bindAllFunctions(): void;
    /**
     * This sets all the data that can be shared by the component. There can only be one emitter for each data type.
     *
     * @param {Object} params
     * @param {Array.<Object>} params.emitters This is a list of objects (`{ type: string, data: function }`) which contain a type and a function to get the data.
     * @example
     * FSBL.Clients.DragAndDropClient.setEmitters({
     * 	emitters: [
     * 		{
     * 			type: "symbol",
     * 			data: getSymbol
     * 		},
     * 		{
     * 			type: "chartiq.chart",
     * 			data: getChart
     *		}
    * 	]
    * })
    */
    setEmitters(params: {
        emitters: emitter[];
    }): void;
    /**
     * Adds receivers for the data that can be received by the component. There can be any number of receivers for each data type. You can also use regular expressions to specify the data that can be received.
     *
     * @param {object} params
     * @param {Array<receiver>} params.receivers This is a list of objects (`{ type: string, handler: function }`), each containing a type and a handler function to call with the data once received. The receiver can take a regular expression as its type to provide the ability to receive multiple data types. Each type can have multiple handlers so you can use the same type multiple times in your call.
     * @todo document the receivers type. For now, the description above will suffice.
     * @example
     * FSBL.Clients.DragAndDropClient.addReceivers({
     * 	receivers: [
     * 		{
     * 			type: "symbol",
     * 		 	handler: changeSymbol
     * 		}, {
     * 			type: "chartiq.chart",
     * 			handler: openChart
     * 		}
     * ])
     * FSBL.Clients.DragAndDropClient.addReceivers({
     * 	receivers: [
     *		{
     * 			type: &#47;.*&#47;,
     *	 		handler: getEverythingAComponentCanEmit
     * 		}
     * 	]
     * })
     */
    addReceivers(params: {
        receivers: receiver[];
    }): void;
    /**
     * updateReceivers updates the handlers for the data that can be received by the component.
     *
     * @param {object} params
     * @param {Array.<Object>} params.receivers This is a list of objects (`{ type: string, handler: Function, oldHandler: Function }`), each containing a type, the existing handler (oldHandler) and a handler function to replace the old handler with.
     * @private
     * @example
     * DragAndDropClient.updateReceivers({
     * 	receivers: [
     * 		{
     * 			type: "symbol",
     *			oldHandler: updateSymbol,
     * 		 	handler: changeSymbol
     * 		}, {
     * 			type: "chartiq.chart",
     *			oldHandler: openChart_old,
     * 			handler: openChart_new
     * 		}
     * 	])
     * DragAndDropClient.updateReceivers({
     * 	receivers: [
     *		{
     * 			type: /.*&#47;,
     *	 		oldHandler: getEverythingAComponentCanEmit,
     *			handler: doSomethingWithAllThisData
     * 		}
     * 	])
     */
    updateReceivers(params: {
        receivers: receiverUpdate[];
    }): void;
    /**
     * removeReceivers removes the handlers for the data that can be received by the component.
     *
     * @param {object} params.receivers This is a list of objects, each containing a type and the handler that needs to be removed.
     * @private
     * @example
     * DragAndDropClient.removeReceivers({
     * 	receivers: [
     * 		{
     * 			type: "symbol",
     * 		 	handler: changeSymbol
     * 		}, {
     * 			type: "chartiq.chart",
     * 			handler: openChart
     * 		}
     * 	])
     * DragAndDropClient.removeReceivers({
     * 	receivers: [
     *		{
     * 			type: /.*&#47;,
     *	 		oldHandler: getEverythingAComponentCanEmit
     * 		}
     * 	])
     */
    removeReceivers(params: {
        receivers: receiver[];
    }): void;
    /**
     * This is a drag event handler for an element that can be dragged to share data. Our sample Window Title Bar component uses this internally when the share icon is dragged. This can be attached to any element that needs to be draggable. The data from all emitters that match receivers in the drop component is automatically shared.
     *
     * @param {event} event
     *
     */
    dragStart(event: any): void;
    /**
     * This is a drag event handler to enable dragging specific data that is not tied to an emitter. For example, an item in a list.
     *
     * @param {event} event
     * @param {any} data
     *
     * @example
     * element.addEventListener('dragstart', function(event) {
     * 		var data = {
     * 			'rsrchx.report': {
     *				url: event.target.href,
     *			}
     * 		};
     * 		FSBL.Clients.DragAndDropClient.dragStartWithData(event, data);
     * })
     *
     */
    dragStartWithData(event: any, data: any): void;
    /**
     * @private
     * @param {} sharedData
     * @param {*} shareMethod
     */
    handleSharedData(sharedData: any, shareMethod: any): void;
    /**
     * This is a drop event handler that can be attached to any element that you want to be a drop zone for the Drag and Drop Client. It automatically requests data for all the data elements that are common between the receiver and the emitter.
     *
     * @param {event} event
     */
    drop(event: any): void;
    /**
     * @param {string} error
     * @param {object} params This is a list of strands whose data is required
     * @private
     */
    emit(error: any, params: {
        data: string[];
        sendQueryResponse: (err?: any, data?: any) => void;
    }): void;
    /**
     * This gets a list of components that can receive a specific type. It looks in the config for each componentType for an advertiseReceivers property.
     *
     * @example
     * "Advanced Chart": {
     *		...
     * 		"component": {
     * 			"advertiseReceivers": ["chartiq.chart", "symbol"]
     * 		},
     *		...
     *
     *
     * @param {object} params
     * @param {string} [params.type]
     * @param {Function} cb callback to be invoked with the list of component types
     * @private
     *
     * @example
     * DragAndDropClient.getComponentsThatCanReceiveType ({ type: "chartiq.chart"}, callback)
     *
     */
    getComponentsThatCanReceiveType(dataType: any, cb: any): void;
    /**
     * This will either open a component with the shared data or publish the shared data using the Linker Client if the window is linked.
     * @experimental
     *
     * @param {object} params
     * @param {any} params.data Data to pass to the opened component.
     * @param {boolean} params.publishOnly if the component is linked, this will only publish the data, not force open a window if it does not exist. If the component is not linked, this is ignored.
     * @param {function} params.multipleOpenerHandler Optional. This function is called with on object that contains a map of componentTypes to the data types they can open. It must return a list of components to be opened. If no handler is provided, the first found component will be chosen. It is possible that the component opened may not handle all the data provided.
     * @param {function} cb Callback invoked with action taken.
     *
     * @since 1.5: multipleOpenerHandler and callback added
     *
     */
    openSharedData(params: {
        data?: any;
        publishOnly?: boolean;
        multipleOpenerHandler?: Function;
    }, cb: StandardCallback): void;
    /**
     * @private
     */
    addWindowHighlight(canReceiveData: any): void;
    /**
     * @private
     */
    removeWindowHighlight(): void;
    /**
     * @private
     */
    canReceiveData(dataTypeArray: any, receiverKeys?: any): boolean;
    /**
     * @private
     */
    dragover(e: any): boolean;
    /**
     * @private
     */
    addListeners(cb: any): void;
    /**
     * @private
     *
     * @param {*} cb
     * @memberof DragAndDropClient
     */
    getFinsembleWindow(cb: any): void;
}
declare var dragAndDropClient: DragAndDropClient;
export default dragAndDropClient;
