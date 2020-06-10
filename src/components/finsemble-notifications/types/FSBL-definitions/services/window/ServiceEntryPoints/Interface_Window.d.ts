/**
 * DIAGRAM: https://realtimeboard.com/app/board/o9J_kzFZvJ0=/?moveToWidget=3074457346145087095
 *
 */
import { BasePrivateWindowInterface, WindowCreationParams } from "./Interface_BasePrivateWindow";
import { WindowIdentifier } from "../../../globals";
interface BoxBounds {
    top: number;
    left: number;
    height: number;
    width: number;
    right?: number;
    bottom?: number;
}
export interface WindowBounds extends BoxBounds {
}
export interface GroupBounds extends BoxBounds {
}
export declare type TabbingParams = {
    componentWindow: WindowIdentifier;
};
export declare type RegionTrackingParams = Object;
export declare type TrackingStartContext = {};
export declare type TrackingStopReason = {};
export declare type Params = {};
export declare type DockingParams = {};
export declare type FeatureParams = {};
export declare type WindowRegion = {};
export declare type WindowsGroupParams = {};
export declare type WindowServiceParams = {
    name: string;
};
export declare namespace Interface_Window {
    interface BasePrivateWindow extends BasePrivateWindowInterface {
    }
    interface RegionMapper {
        regionMouseTracker: RegionTracking;
        tabbingRegionHandler: Tabbing;
    }
    interface Tabbing {
        /**
         * Enable tabbing region within a components window. This enables the RegionMapper for the component, which in affect allows tabbing on the component.
          *
         * @param {TabbingParams} params parameter object
         * @param {WindowIdentifier} params.componentWindow specifics the component window on which the tabbing region will be enabled
         * @memberof Tabbing
         */
        enableRegion(params: TabbingParams): Promise<any>;
        /**
     * Disable tabbing region within a components window. This disables the RegionMapper for the component, which in affect turns off tabbing on the component.
        *
         * @param {TabbingParams} params parameter object
     * @param {WindowIdentifier} params.componentWindow specifics the component window on which the tabbing region will be disabled
     * @memberof Tabbing
     */
        disableRegion(params: TabbingParams): Promise<any>;
        /**
         * Sets the active tab.  Only the act tab's window is displayed, with the other tabbed windows hidden
     *
         * @param {TabbingParams} params parameter object
         * @param {WindowIdentifier} params.componentWindow specifics the component window on which the active tab will be set
         * @param {number} params.position position within tabList (see getDataStore) of tabbing being set to active
         * @memberof Tabbing
         */
        setActiveTab(params: TabbingParams): Promise<any>;
        /**
         * Reorders the internal list of tabs -- the internal list is used by setActiveTab and should match the tabbing UI
         *
         * @param {TabbingParams} params parameter object
         * @param {WindowIdentifier} params.componentWindow specifics the component window for which the corresponding tab list will be reorder
         * @param {Array} params.tabList an order list/array of window names (one for each tab specifying the new order)
         * @memberof Tabbing
         */
        reorderTabs(params: TabbingParams): Promise<any>;
        /**
         * Returns in the callback the store for tabbing store for the component.
         *
         * where the tabbing store contains one object with the following properties
         *				{
         *					tab list: an order list/array of window names (one for each tab)
         *					visibleTab: index into tabs list of the currently visible tab
         *					_private (internal data for diagnostic purposes)
         *				}
         *
         * @param {TabbingParams} params parameter object
         * @param {WindowIdentifier} params.componentWindow specifics the component window for with the corresponding tabbing store will be returned in the callback
         * @returns the data store for the tabbing object
         * @memberof Tabbing
         */
        getDataStore(params: TabbingParams): Promise<any>;
    }
    interface RegionTracking {
        /**
         * Starts mouse tracking within the RegionMapper, in affect activating Tabbing and Tiling. Depending on the mouse location, either the DesktopRegionHandler, TilingRegionHandler, or TabbingRegionHandler will be called once time interval (e.g. 1 millisecond) until stopTracking is invoked.
         *
         * @param {Params} params - Optional parameter object
         * @param {any} params.type - identifiers a region type (e.g. tabbing, tiling, desktop)
         * @param {any} params.identifier - identifiers a region (e.g. window name, group name, monitor name)
         * @memberof RegionTracking
         */
        enableRegion(params: Params): Promise<any>;
        /**
         * Starts mouse tracking within the RegionMapper, in affect activating Tabbing and Tiling. Depending on the mouse location, either the DesktopRegionHandler, TilingRegionHandler, or TabbingRegionHandler will be called once time interval (e.g. 1 millisecond) until stopTracking is invoked.
         *
         * @param {Params=} params - Optional parameter object
         * @param {TrackingStartContext=} params.context - optionally specifies the context from with tracking was started
         * @memberof RegionTracking
         */
        startTracking(params: Params): Promise<any>;
        /**
         * Stop mouse tracking within the RegionMapper, in affect deactivating Tabbing and Tiling.
         *
         * @param {Params=} params - Optional parameter object
         * @param {TrackingStopReason=} params.reason - optionally specifies the reason tracking was stopped
         */
        stopTracking(params: Params): Promise<any>;
    }
    interface Group {
        create(params: WindowsGroupParams): Promise<any>;
        delete(params: WindowsGroupParams): Promise<any>;
        addWindows(params: WindowsGroupParams): Promise<any>;
        removeWindows(params: WindowsGroupParams): Promise<any>;
        getGroups(params: WindowsGroupParams): Promise<any>;
        getWindows(params: WindowsGroupParams): Promise<any>;
    }
    interface Docking {
        register(params: DockingParams): Promise<any>;
        unregister(params: DockingParams): Promise<any>;
    }
    interface WindowFeatures {
        closeWindows(params: FeatureParams): Promise<any>;
        bringToFrontWindows(params: FeatureParams): Promise<any>;
        minimizeWindows(params: FeatureParams): Promise<any>;
        hyperFocusWindows(params: FeatureParams): Promise<any>;
    }
    interface PublicWindowInterface {
        create(params: WindowCreationParams): Promise<any>;
        close(params: Object): any;
        minimize(params: Object): any;
        maximize(params: Object): any;
        restore(params: Object): any;
        focus(params: Object): any;
        bringToFront(params: Object): any;
        setBounds(params: Object): any;
        getBounds(params: Object): any;
        startMove(params: Object): any;
        stopMove(params: Object): any;
        hide(params: Object): any;
        show(params: Object): any;
        alwaysOnTop(params: Object): any;
        setOpacity(params: Object): any;
        getCurrentState(params: Object): any;
        getOptions(params: Object): any;
        addListener(params: Object): any;
        removeListener(params: Object): any;
    }
}
export {};
