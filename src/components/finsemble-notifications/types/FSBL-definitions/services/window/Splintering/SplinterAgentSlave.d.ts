/**
 * Spawns a new window by interfacing with the underlying container (OpenFin or Electron).
 *
 * @param err
 * @param message Object containing the windowDescriptor in its data property.
 * @param manifestToUse Leave undefined in OpenFin environments (i.e, when splintering
 * is turned on). When splintering is short-circuited (i.e in Electron), you must pass in the correct manifest.
 */
export declare function onSpawnRequest(err: any, message: {
    data: {
        windowDescriptor: any;
    };
}, manifestToUse?: any): void;
