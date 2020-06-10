/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
import { ILogger } from "./ILogger";
import { ICentralLogger } from "./ICentrallogger";
declare function IsLogMessage(channel: any): boolean;
/** An implementation of the ICentralLogger interface that
 * merely logs straight to the console rather than going over to
 * Central Logging service. Used in situations where use of the
 * Central Logging service is not possible (such as in test
 * environments, or in the Central Logging service itself).
 */
export declare class LocalLogger implements ICentralLogger {
    start: () => void;
    isLogMessage: typeof IsLogMessage;
    setting: () => {
        console: {
            Error: boolean;
            Warn: boolean;
            Info: boolean;
            Log: boolean;
            Debug: boolean;
        };
        dev: {
            Error: boolean;
            Warn: boolean;
            Info: boolean;
            Log: boolean;
            Debug: boolean;
            Verbose: boolean;
            LocalOnly: boolean;
        };
        system: {
            Error: boolean;
            Warn: boolean;
            Info: boolean;
            Log: boolean;
            Debug: boolean;
            Verbose: boolean;
            LocalOnly: boolean;
        };
        perf: {
            Error: boolean;
            Warn: boolean;
            Info: boolean;
            Log: boolean;
            Debug: boolean;
            Verbose: boolean;
            LocalOnly: boolean;
        };
    };
    callStack: () => string;
    unregisterClient: (_: any) => void;
    setRouterClient: () => void;
    warn: {
        (message?: any, ...optionalParams: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    info: () => void;
    log: {
        (message?: any, ...optionalParams: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    debug: {
        (message?: any, ...optionalParams: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    error: {
        (message?: any, ...optionalParams: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    verbose: () => void;
    system: ILogger;
    perf: ILogger;
}
export {};
