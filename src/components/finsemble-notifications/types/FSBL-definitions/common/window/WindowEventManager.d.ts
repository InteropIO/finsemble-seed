import { EventEmitter } from "events";
import { WindowEventName, WindowEvent, BoundsChangeEvent } from "../../globals";
/**
 * DIAGRAM: https://realtimeboard.com/app/board/o9J_kzFZvJ0=/?moveToWidget=3074457346159922380
 * The reason I want this to exist is so that the windows don't have to worry about subscribing to and unsubscribing from events. This object will handle all event subscription/emission for the pubic and private window implementations.
 *
 * It will be capable of listening for remote events and triggering local events to match. It will handle router cleanup, and should narrow down the places that we have to look when an event isn't firing properly.
 *
 * Outside of the windowService, events can be listened for by simply calling:
 * finsembleWindow.addListener(event, handler);
 *
 * finsembleWindow.addListener will call finsembleWindow.WindowEventManager.listenForRemoteEvent();
 *
 * The private window implementations will use the proxyEventsForWindow method in order to distribute events to remote wraps.
 *
 * @interface WindowEventManager
 * @extends {EventEmitter}
 */
export declare interface WindowEventManager extends EventEmitter {
    listeningFor: any[];
    /**
     * Array of events that we're subscribed to remotely. When receiving a remote event, the event manager will emit a local event.
     * @type {any}
     * @memberof WindowEventManager
     */
    remoteEventSubscriptions: any;
    windowName: string;
    /**
     * Disconnects all router listeners. Removes all listeners added to the event emitter.
     * @memberof WindowEventManager
     */
    cleanup(): void;
    /**

    * Returns router channel name for a given window event + window name combination.
     *
     * @param {WindowEventName} eventName
     * @returns {string}
     * @memberof WindowEventManager
     */
    getChannelName(eventName: WindowEventName): string;
    /**
     * Single point of entry to the eventEmitter's `emit` method. This will be called when the router listener is fired in response to an event happening somewhere else in the system. Could also be triggered by an event fired from the underlying wrapper.
     *
     * @private
     * @param {WindowEventName} eventName
     * @param {WindowEvent | BoundsChangeEvent} data
     * @memberof WindowEventManager
     */
    emitLocalEvent(eventName: WindowEventName, data: WindowEvent | BoundsChangeEvent): void;
    /**
     * Adds a router listener for remote events if we are not already listening for that event. If the optional handler is passed in, will add a local event listener to be triggered the next time the event fires.
     *
     * @param {WindowEventName} eventName
     * @param {Function} [handler]
     * @memberof WindowEventManager
     */
    listenForRemoteEvent(eventName: WindowEventName, handler?: Function): void;
    /**
     * Convenience function to allow wrap to receive multiple remote events. Dev would then need to add a handler for each event that they care about. May not be useful.
     *
     * @param {WindowEventName[]} eventList
     * @memberof WindowEventManager
     */
    listenForRemoteEvents(eventList: WindowEventName[]): void;
    /**
     * Currently we cannot have a special routerClient for every object. So this method will keep track of channel/listener combinations so we can cleanup when the wrap calls cleanup.
     *
     * @param {*} eventName
     * @param {*} handler
     * @memberof WindowEventManager
     */
    rememberRouterChannelForLaterRemoval(eventName: WindowEventName, handler?: Function): void;
    /**
     * Broadcasts an event to any event manager listening for this event.
     *
     * @param {WindowEventName} eventName
     * @param {WindowEvent | BoundsChangeEvent} data
     * @memberof WindowEventManager
     */
    transmitRemoteEvent(eventName: WindowEventName, data: WindowEvent | BoundsChangeEvent): void;
    /**
     * Used by the window implementations in the window service. This method will emit an event up to the local process, and transmit an event out to the rest of the system.
     * @private
     * @param {WindowEventName[]} eventName
     * @param {WindowEvent | BoundsChangeEvent} data
     * @memberof WindowEventManager
     */
    trigger(eventName: WindowEventName, data?: WindowEvent | BoundsChangeEvent): void;
}
declare type EventManagerConstructorParams = {
    name: string;
};
export declare class WindowEventManager extends EventEmitter implements WindowEventManager {
    /**
    * Array of events that we're subscribed to remotely. When receiving a remote event, the event manager will emit a local event.
    * @type {WindowEventName[]}
    * @memberof WindowEventManager
    */
    constructor(params: EventManagerConstructorParams);
    _addListener(event: string | symbol, listener: (...args: any[]) => void): void;
}
export {};
