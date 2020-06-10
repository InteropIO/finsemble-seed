import { EventEmitter } from "events";
declare type StartupDependencyParams = {
    callback: Function;
    dependencies: string[];
};
/**
 * Small class to hold on to dependencies and callbacks. Also emits a timeout event that the startupManager is listening for. When it times out, the startupManager catches the event and generates a message that includes all of the offline clients and services. It then causes this class to emit an  err event that the baseService is listening for. This arrangement is set up for a couple of reasons.
 * 1. I can't use the logger in here because the logger uses the startupManager, and there'd be a circular dependency.
 * 2. FSBLDependencyManager is a singleton, and there can be multiple services living in a single window. I didn't want them all to log that they were offline if they weren't (e.g., if I'd put the emitter on the StartupManager instead of this class).
 */
declare class StartupDependency extends EventEmitter {
    startupTimer: number | null;
    callback: Function;
    dependencies: string[];
    constructor(params: StartupDependencyParams);
    /**
     * Removes the startup timer (because the dependency was resolved within the allotted time);
     */
    clearStartupTimer(): void;
    /**
     * If the dependency hasn't resolved within STARTUP_TIMEOUT_DURATION, emit a timeout event that the StartupManager can catch.
     */
    setStartupTimer(): void;
}
/**
 * @private
 */
declare class StartupManager {
    onlineClients: string[];
    onlineServices: string[];
    dependencies: object;
    AuthorizationCompleted: boolean;
    startupTimers: object;
    startupTimerFired: boolean;
    servicesAreAllOnline: object;
    clientsAreAllOnline: object;
    /**
     * @private
     */
    constructor();
    /**
     * This function and `checkDependencies` are the most important parts of this class. This function accepts a FinsembleDependency object and a callback to be invoked when all required dependencies are ready.
     *
     * @param {FinsembleDependency} dependencies
     * @param {any} callback
     * @memberof StartupManager
     */
    waitFor(dependencies: any, callback: any): StartupDependency;
    /**
     * This method generates a helpful error message giving possible reasons for why the service is offline. After the message is generated, it emits an event on the dependency that's passed in as a parameter. The BaseService is listening for this event, and logs the error message to the central logger.
     * @param {Dependency} dependency
     */
    onDependencyTimeout(dependency: any): void;
    /**
     * This function loops through all of the registered dependencies and checks to see if the conditions have been met. If so, it invokes the callback and removes the reference to the dependency.
     *
     * @memberof StartupManager
     */
    checkDependencies(): void;
    getOfflineClients(): any[];
    getOfflineServices(): any[];
    /**
     * Iterates through required service list, returns false if any required service is offline.
     *
     * @param {any} serviceList
     * @memberof StartupManager
     */
    checkServices(serviceList: any): any;
    /**
     * Iterates through required client list, returns false if any required client is offline.
     *
     * @param {any} clientList

     * @memberof StartupManager
     */
    checkClients(clientList: any): any;
    /**
     * When a service comes online, we push it onto our array of online services, and run through all of the registered dependencies.
     *
     * @param {any} serviceName
     * @memberof StartupManager
     */
    setServiceOnline(serviceName: any): void;
    /**
     * Sets an array of services online. Only happens once at startup.
     *
     * @param {any} serviceList
     * @memberof StartupManager
     */
    setServicesOnline(serviceList: any): void;
    /**
     *
     *
     * @param {any} clientName

     * @memberof StartupManager
     */
    setClientOnline(clientName: any): void;
    /**
     * Returns the array of online clients.
     *

     * @memberof StartupManager
     */
    getOnlineClients(): string[];
    /**
     * Returns the array of online services.
     *

     * @memberof StartupManager
     */
    getOnlineServices(): string[];
    /**
     * Method to make sure that `this` is correct when the callbacks are invoked.
     *
     * @memberof StartupManager
     */
    bindCorrectContext(): void;
}
/**
 * @private
 */
declare class ShutdownManager {
    offlineServices: string[];
    dependencies: object;
    /**
     * @private
     */
    constructor();
    /**
     * This function and `checkDependencies` are the most important parts of this class. This function accepts a FinsembleDependency object and a callback to be invoked when all required dependencies are ready.
     *
     * @param {FinsembleDependency} dependencies
     * @param {any} callback
     * @memberof StartupManager
     */
    waitFor(dependencies: any, callback: any): void;
    /**
     * This function loops through all of the registered dependencies and checks to see if the conditions have been met. If so, it invokes the callback and removes the reference to the dependency.
     *
     * @memberof ShutdownDependencies
     */
    checkDependencies(): void;
    /**
     * Iterates through required service list, returns false if any required service is offline.
     *
     * @param {any} serviceList

     * @memberof StartupManager
     */
    checkServices(serviceList: any): any;
    setServiceOffline(service: any): void;
}
/**
 * This is a class that handles FSBL client/service dependency management. Given a list of services and/or clients, it will invoke a callback when all dependencies are ready. This is a singleton.
 * @shouldBePublished false
 * @private
 * @class FSBLDependencyManager
 */
declare class FSBLDependencyManager extends EventEmitter {
    /**
     * Binds context, and listens for services to come online.
     * Creates an instance of FSBLDependencyManager.
     * @private
     * @memberof FSBLDependencyManager
     */
    startup: StartupManager;
    shutdown: ShutdownManager;
    AuthorizationCompleted: any;
    RouterClient: any;
    name: any;
    constructor();
    /**
 * Method to make sure that `this` is correct when the callbacks are invoked.
 *
 * @memberof StartupManager
 */
    bindCorrectContext(): void;
    setClientOnline(client: any): void;
    onServiceStateChange(data: any): void;
    /**
     * Listens on the router for services to come online. The first subscriber gets the activeServices as of object instantiation. The 2nd subscriber listens for services to come online after the object is created. We should consider make this all one subscriber, though I see the advantage of having this setup.
     *
     */
    listenForServices(): void;
    onAuthorizationCompleted(callback: any): void;
}
/**
 * This is a class that handles FSBL client/service dependency management. Given a list of services and/or clients, it will invoke a callback when all dependencies are ready. This is a singleton.
 * @shouldBePublished false
 * @private
 * @class FSBLDependencyManager
 */
export declare let FSBLDependencyManagerSingleton: FSBLDependencyManager;
export default FSBLDependencyManagerSingleton;
