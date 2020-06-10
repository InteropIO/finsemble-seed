import { ResponderMessage } from "../clients/IRouterClient";
import { StandardCallback } from "../globals";
declare class FakeRouter {
    queryResponders: {
        responderChannel: string;
        cb: StandardCallback<ResponderMessage>;
    }[];
    transmitListeners: {
        channel: string;
        eventHandler: StandardCallback;
    }[];
    onReady(cb: any): void;
    unsubscribe(topic: string): void;
    publish(topic: string, data: any): void;
    subscribe(topic: any, cb: any): string;
    addPubSubResponder(topic: string, something: any): void;
    reset(): void;
    addListener(channel: string, eventHandler: StandardCallback): void;
    removeListener(channel: string, eventHandler: StandardCallback): void;
    transmit(toChannel: string, event: {
        err: string | Error;
        data: any;
    } | any, options?: {
        suppressWarnings: boolean;
    }): void;
    addResponder(channel: string, queryEventHander: StandardCallback<ResponderMessage>): void;
    removeResponder(responderChannel: string): void;
    query(responderChannel: string, queryEvent: Record<string, any>, responderEventHandler: StandardCallback): Promise<void> | Promise<{}>;
}
export declare const fakeRouterClient: FakeRouter;
export declare const addListenerSpy: any;
export declare const removeListenerSpy: any;
export declare const transmitSpy: any;
export declare const addResponderSpy: any;
export declare const removeResponderSpy: any;
export declare const querySpy: any;
export {};
