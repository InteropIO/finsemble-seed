/**
 * DIAGRAM: https://realtimeboard.com/app/board/o9J_kzFZvJ0=/?moveToWidget=3074457346145087095
 */
import { TrackingStopReason, Params } from "../ServiceEntryPoints/Interface_Window";
export declare type Consumed = boolean;
export interface RegionHandler {
    enableRegion(params: Params): Promise<any>;
    triggerAt(coordinates: Coordinates): Consumed;
    stop(reason: TrackingStopReason): void;
    exit(): void;
}
