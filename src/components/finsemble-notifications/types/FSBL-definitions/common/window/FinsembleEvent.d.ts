import { EventEmitter } from "events";
import { WindowEvent } from "../../globals";
/**
 * Notes:
 * Client calls finsembleWindow.addEventListener("event", handler)
 *
 * hander gets called with handler(FinsembleEvent)
 *
 * in the handler:
 function handler(e) {
    if (e.delayable) {
        e.wait();
        function myStuff() {
            //my stuff here
            if (cancel && e.cancelable) {
                e.cancel();
            } else {
                e.done();
            }
        }
    }
}
 *
 *
 *
 */
/**
 * This object is passed to event handlers so they can interrupt events. This is used in conjunction with the implementation of add/remove event listeners in BaseWindow and FinsembleWindow
 */
declare class FinsembleEvent extends EventEmitter {
    cancelable: boolean;
    delayable: boolean;
    delayed: boolean;
    event: WindowEvent;
    source: any;
    data: any;
    constructor(params: any);
    wait(): void;
    cancel(): void;
    done(): void;
    setData(data: any): void;
}
export { FinsembleEvent };
