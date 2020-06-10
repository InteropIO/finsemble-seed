/**
 * The system needs to use certain functionality on windows that aren't managed by the window service. This code lives inside of the old 'docking' code, which operates on dockableWindows. For windows that aren't managed by the window service, we need to create a functional interface so that we don't have to rewrite all that code. This is used in getMonitorForWindow. Given an object with a name and some bounds, it'll create a dummy object that won't throw errors when we try to operate on it.
 */
export declare class MockDockableWindow {
    name: string;
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    constructor(params: any);
    getBounds: () => {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
    };
}
