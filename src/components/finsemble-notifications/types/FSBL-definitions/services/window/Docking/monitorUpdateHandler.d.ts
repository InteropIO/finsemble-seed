/**
 * Monitors from the OS do not know about claimed space. Here, we add the unclaimedRect to the monitor.
 */
export declare function addUnclaimedRectToRawMonitor(newMonitors: any): any[];
/**
 * 1. Ask the system where the window is.
 * 2. Make sure that position is on a monitor.
 * 3. If the window has moved, return an object describing the new position for the window. Otherwise return null
 * @param params - Object containing a dockable window and a moveable Group for that window if it exists
 */
export declare function deriveWindowPosition(params: any): Promise<{}>;
/**
 * Given a list of moves, will return an object for groups, and an array for non group moves.
 * These are split out because groups are handled differently, and we want docked windows to
 * be moved last (to prevent claimed space conflicts).
 * @param moveList
 */
export declare function splitWindowMoves(moveList: any): {
    groupMoves: {};
    nonGroupMoves: any[];
};
