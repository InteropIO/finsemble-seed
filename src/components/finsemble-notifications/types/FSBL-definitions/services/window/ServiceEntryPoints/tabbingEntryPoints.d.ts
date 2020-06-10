/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
export declare class TabbingEntry {
    stackedWindowManager: any;
    constructor(stackedWindowManager: any);
    initialize(done: any): Promise<void>;
    shutdown(done: any): void;
    bindAllFunctions(): void;
    setupInterfaceListener(methodName: any, methodFunction: any): void;
    setupStackedWindowManagerListeners(): void;
}
