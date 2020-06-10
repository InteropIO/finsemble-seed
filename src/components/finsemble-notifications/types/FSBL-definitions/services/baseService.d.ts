import { IRouterClient } from "../clients/IRouterClient";
import { FinsembleDependencyObject, ServiceState, ServiceConstructorParams } from "../globals";
export declare class BaseService {
    customData: any;
    initialize: Function;
    listeners: {
        onShutdown?: Function[];
    };
    Logger: any;
    onBaseServiceReadyCB: null | Function;
    name: string;
    parentUuid: string;
    RouterClient: IRouterClient;
    setOnConnectionCompleteCB: null | Function;
    shutdownDependencies: FinsembleDependencyObject;
    start: Function;
    started: boolean;
    startupDependencies: FinsembleDependencyObject;
    status: ServiceState;
    waitedLongEnough: boolean;
    constructor(params?: ServiceConstructorParams);
    /**
    * Waits for the dependencies. At the end of this function, it will trigger the child service's initialize function (or onBaseServiceReady).
    * @note This used to be BaseService.start
    * @private
    */
    waitForDependencies(): Promise<{}>;
    /**
     * Transmits the serviceOnline message that the rest of the dependency manager objects system are listening for.
     */
    setOnline(): void;
    /**
     * Invokes a method passed in (or on) the object that inherits from the BaseService. In other words, the service instance will have its initialize function called, unless it's using old code, in which case we will have cached the callback earlier.
     */
    onDependenciesReady(): void;
    onBaseServiceReady(func: any): void;
    /**
     * Really only for shutdown right now. Simple array that gets looped through on shutdown.
     * @param {string} listenerType
     * @param {function} callback The callback to be invoked after the method completes successfully.
     */
    addEventListener(listenerType: any, callback: any): void;
    /**
     * When the application sends out a shutdown message, this function is invoked. It iterates through any registered cleanup methods. When all of them have finished, it sends a response to the application saying that it's completed cleanup (`shutdownComplete`, below).
     * @private
    */
    onShutdown(cb: any): void;
    /**
     * When the application sends out a shutdown message, this function is invoked. It iterates through any registered cleanup methods. When all of them have finished, it sends a response to the application saying that it's completed cleanup (`shutdownComplete`, below).
     * @private
    */
    handleShutdown(err: any, message: any): void;
    /**
     * Fired when all cleanup methods have been finished.
     * @private
    */
    shutdownComplete(): void;
}
