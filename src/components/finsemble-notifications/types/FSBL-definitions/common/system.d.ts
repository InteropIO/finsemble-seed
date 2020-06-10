declare class SystemWindow {
    constructor(params: any, cb: any, errCb?: any);
    static readonly getCurrent: any;
    static readonly wrap: any;
}
declare class Application {
    constructor(params: any, cb: any, errCb?: any);
    static readonly getCurrent: any;
    static readonly wrap: any;
}
declare class SystemNotification {
    constructor(params: any);
}
export declare class System {
    static readonly Application: typeof Application;
    static readonly Window: typeof SystemWindow;
    static readonly Notification: typeof SystemNotification;
    static getMousePosition(cb: any): void;
    static getMonitorInfo(cb: any): void;
    static readonly ready: any;
    static readonly getHostSpecs: any;
    static readonly launchExternalProcess: any;
    static readonly terminateExternalProcess: any;
    static readonly getAllApplications: any;
    static readonly exit: any;
    static readonly clearCache: any;
    static readonly showDeveloperTools: any;
    static readonly getRuntimeInfo: any;
    static readonly addEventListener: any;
    static readonly getVersion: any;
    static readonly openUrlWithBrowser: any;
    static readonly getAllWindows: any;
    static FinsembleReady(cb: any): any;
    /**
     * Performs handshake with FEA to indicate the primary application started successfully
     */
    static startupApplicationHandshake(): void;
    static closeApplication(app: any, cb?: Function): Promise<{}>;
    static isElectron(): boolean;
}
export {};
