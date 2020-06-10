import { WindowIdentifier } from "../../../globals";
export interface WindowCreationParams {
    name: string;
}
export declare type WindowParams = {
    name: string;
};
export interface BasePrivateWindowInterface {
    _create(params: WindowCreationParams): Promise<any>;
    _wrap(windowIdentifier: WindowIdentifier): Promise<any>;
    _close(params: WindowParams): Promise<any>;
    _minimize(params: WindowParams): Promise<any>;
    _maximize(params: WindowParams): Promise<any>;
    _restore(params: WindowParams): Promise<any>;
    _focus(params: WindowParams): Promise<any>;
    _bringToFront(params: WindowParams): Promise<any>;
    _setBounds(params: WindowParams): Promise<any>;
    _getBounds(params: WindowParams): Promise<any>;
    _startMove(params: WindowParams): Promise<any>;
    _stopMove(params: WindowParams): Promise<any>;
    _hide(params: WindowParams): Promise<any>;
    _show(params: WindowParams): Promise<any>;
    _alwaysOnTop(params: WindowParams): Promise<any>;
    _setOpacity(params: WindowParams): Promise<any>;
    _getCurrentState(params: WindowParams): Promise<any>;
    _getOptions(params: WindowParams): Promise<any>;
    _addListener(params: WindowParams): Promise<any>;
    _removeListener(params: WindowParams): Promise<any>;
}
