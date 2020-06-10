import { Params, Interface_Window, TabbingParams, TrackingStopReason } from "../ServiceEntryPoints/Interface_Window";
import { RegionHandler } from "./InterfaceRegionMapper";
declare class BaseRegionHandler implements RegionHandler {
    enableRegion(params: Params): Promise<{}>;
    triggerAt(coordinates: Coordinates): boolean;
    stop(reason: TrackingStopReason): void;
    exit(): void;
}
declare class RegionMouseTracker implements Interface_Window.RegionTracking {
    enableRegion(params: Params): Promise<{}>;
    startTracking(params: Params): Promise<{}>;
    stopTracking(params: Params): Promise<{}>;
}
declare class TabbingRegionHandler extends BaseRegionHandler implements Interface_Window.Tabbing, RegionHandler {
    enableRegion(params: Params): Promise<{}>;
    disableRegion(params: TabbingParams): Promise<{}>;
    setActiveTab(params: TabbingParams): Promise<{}>;
    reorderTabs(params: TabbingParams): Promise<{}>;
    getDataStore(params: TabbingParams): Promise<{}>;
    triggerAt(coordinates: Coordinates): boolean;
    stop(reason: TrackingStopReason): void;
    exit(): void;
}
declare class DesktopRegionHandler extends BaseRegionHandler implements RegionHandler {
    enableRegion(params: Params): Promise<{}>;
    triggerAt(coordinates: Coordinates): boolean;
    stop(reason: TrackingStopReason): void;
    exit(): void;
}
declare class TilingRegionHandler extends BaseRegionHandler implements RegionHandler {
    enableRegion(params: Params): Promise<{}>;
    triggerAt(coordinates: Coordinates): boolean;
    stop(reason: TrackingStopReason): void;
    exit(): void;
}
declare class RegionMapper implements Interface_Window.RegionMapper {
    regionMouseTracker: RegionMouseTracker;
    desktopRegionHandler: DesktopRegionHandler;
    tilingRegionHandler: TilingRegionHandler;
    tabbingRegionHandler: TabbingRegionHandler;
}
declare var regionMapper: RegionMapper;
export { regionMapper };
