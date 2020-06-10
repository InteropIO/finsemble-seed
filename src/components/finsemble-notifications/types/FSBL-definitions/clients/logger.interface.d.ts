/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
/** The interface which any logger must implement. This is different from
 * the ICentralLogger interface, which is what any logger compatible with
 * the Central Logging service must implement.*/
export interface ILogger {
    /** Used to log information messages.
     *
     * Note that this excluded from Central Logger by default.
     * You may turn it on from within the Central Logger UI.*/
    info(...args: any[]): void;
    /** Used to log debug messages.
     *
     * Note that this excluded from Central Logger by default.
     * You may turn it on from within the Central Logger UI.*/
    debug(...args: any[]): void;
    /** Used to log information messages.
     *
     * Note that this excluded from Central Logger by default.
     * You may turn it on from within the Central Logger UI.*/
    verbose(...args: any[]): void;
    /** Used to log informational messages. */
    log(...args: any[]): void;
    /** Indicates a potentially fatal error or problem. */
    error(...args: any[]): void;
    /** Indicates a non-fatal error or problem. */
    warn(...args: any[]): void;
}
export interface ICentralLogger extends ILogger {
    /** Starts the logger client, readying it for communication with the Central Logging service. */
    start(): void;
    /** A utility function for determining if a given object is formatted for transport via the Central Logging service.*/
    isLogMessage(message: any): boolean;
    setting(): object;
    callStack(): string;
    unregisterClient(client: object): void;
    /** Sets the Router client for this instance of the Logger. This is necessary
     * to do after instantiation because of the mutual dependency between the
     * Logger and the Router client.
     */
    setRouterClient(routerClient: any): void;
    /** One of two logging "namespaces". Used for general-purpose logging. */
    system: ILogger;
    /** One of two logging "namespaces". Used for performance-specific logging.
     * Logs here are augmented with additional performance data.*/
    perf: ILogger;
}
