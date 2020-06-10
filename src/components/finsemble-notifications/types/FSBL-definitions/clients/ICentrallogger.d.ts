/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
import { ILogger } from "./ILogger";
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
