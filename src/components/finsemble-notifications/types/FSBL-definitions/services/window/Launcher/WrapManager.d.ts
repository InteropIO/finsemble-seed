import { WindowIdentifier } from "../../../globals";
declare class WrapManagerSingleton {
    wraps: object;
    constructor();
    add(params: {
        windowIdentifier: WindowIdentifier;
        windowDescriptor: any;
    }): void;
    get(params: {
        windowName: string;
        requester: string;
    }, cb?: Function): Promise<{
        err: any;
        data: any;
    }>;
    remove(params: {
        identifier: WindowIdentifier;
    }, cb: any): void;
    setUuid(name: string, uuid: string): void;
}
export declare let WrapManager: WrapManagerSingleton;
export {};
