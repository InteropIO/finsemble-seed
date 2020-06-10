export declare class LauncherEntry {
    manifest: any;
    launcher: any;
    constructor(manifest: any, launcher: any);
    initialize(done: any): Promise<void>;
    windowServiceChannelName(channelTopic: any): string;
    bindAllFunctions(): void;
    shutdown(done: any): void;
    definePubicInterface(): void;
}
