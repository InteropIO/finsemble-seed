import { Launcher } from "../Launcher/launcher";
import DockingMain from "../Docking/dockingMain";
import { ResponderMessage } from "../../../clients/IRouterClient";
export declare class WindowPrimitives {
    dockingMain: DockingMain;
    launcher: Launcher;
    eventInterruptors: any;
    constructor(dockingMain: DockingMain, launcher: Launcher);
    initialize(done: any): void;
    windowServiceChannelName(channelTopic: any): string;
    bindAllFunctions(): void;
    shutdown(done: any): void;
    definePubicInterface_Window(): void;
    publicWindowHandlerPreface(method: any, queryError: any, queryMessage: any): {
        okay: boolean;
        windowIdentifier: any;
        eventName: any;
        guid: any;
    };
    registerInterruptibleEventHandler(queryError: any, queryMessage: any): Promise<any>;
    /** DH 6/15/2019
     * Because the OS and container keep their own
     * seperate records of which window has focus,
     * it's possible for the two to get out of sync.
     * To prevent that, we send messages from Assimilation
     * and Finsemble-DLL on every OS focus event and handle
     * them here. For every focus event coming from a window not
     * managed by Finsemble's container, we manually blur
     * whatever window had focus previously.
     *
     * If we can figure out a different way to synchronize
     * focus between container and OS, we can remove this ad hoc
     * and manual handling here.
     */
    handleRemoteFocus(queryError: any, queryMessage: any): void;
    removeEventListenerHandler(queryError: any, queryMessage: any): Promise<void>;
    addEventListenerHandler(queryError: any, queryMessage: any): Promise<any>;
    /**
     * Given a windowIdentifier, this function will find the dockableWindow or window instance, figure out which monitor the window is on, and return
     * it back to the caller (public FinsembleWindow).
     *
     * @param {*} queryError callback on error
     * @param {*} queryMessage message data and success callback
     * @returns Promise
     * @memberof WindowPrimitives
     */
    getMonitorForWindowHandler(queryError: any, queryMessage: any): Promise<any>;
    minimizeHandler(queryError: any, queryMessage: any): Promise<void>;
    maximizeHandler(queryError: any, queryMessage: any): Promise<void>;
    restoreHandler(queryError: any, queryMessage: any): Promise<void>;
    focusHandler(queryError: any, queryMessage: any): Promise<void>;
    blurHandler(queryError: any, queryMessage: any): Promise<void>;
    bringToFrontHandler(queryError: any, queryMessage: any): Promise<void>;
    isShowingHandler(queryError: any, queryMessage: any): Promise<void>;
    saveWindowOptionsHandler(queryError: any, queryMessage: any): Promise<void>;
    setBoundsHandler(queryError: any, queryMessage: any): Promise<void>;
    animateHandler(queryError: any, queryMessage: any): Promise<void>;
    getBoundsHandler(queryError: any, queryMessage: any): Promise<void>;
    getOptionsHandler(queryError: any, queryMessage: any): Promise<void>;
    updateOptionsHandler(queryError: any, queryMessage: any): Promise<void>;
    hideHandler(queryError: any, queryMessage: any): Promise<void>;
    showHandler(queryError: any, queryMessage: any): Promise<void>;
    showAtHandler(queryError: any, queryMessage: any): Promise<void>;
    alwaysOnTopHandler(queryError: any, queryMessage: any): Promise<void>;
    setOpacityHandler(queryError: any, queryMessage: any): Promise<void>;
    setComponentStateHandler(queryError: any, queryMessage: any): Promise<void>;
    removeComponentStateHandler(queryError: any, queryMessage: any): Promise<void>;
    setWindowStateHandler(queryError: any, queryMessage: any): Promise<void>;
    saveCompleteWindowStateHandler(queryError: any, queryMessage: any): Promise<void>;
    getWindowStateHandler(queryError: any, queryMessage: any): Promise<void>;
    getComponentStateHandler(queryError: any, queryMessage: any): Promise<void>;
    setParentHandler(queryError: any, queryMessage: any): Promise<void>;
    closeHandler(queryError: any, queryMessage: ResponderMessage): Promise<void>;
}
