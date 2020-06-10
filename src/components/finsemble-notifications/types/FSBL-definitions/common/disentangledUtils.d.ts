export declare function guuid(): any;
export declare function clone(obj: any, logFn: any): any;
export declare function capitalizeFirst(s: string): string;
declare class MockLogger {
    system: any;
    constructor({ debug }?: {
        debug: boolean;
    });
    isLogMessage(): boolean;
    start(): void;
}
export declare const mockLogger: MockLogger;
/** Converts a flat array into an array of arrays of length n.
 *
 * If the length of the array is not divisble by n, the last
 * element of the new array will contain the remainder items.
*/
export declare function chunkArray(n: number, arr: any[]): any;
/**
 * Confirms wether a variable passed to it exists and is a number.
 * If true, returns the parsed Number, otherwise returns false
 * @param {string} [num] A string potentially containing a number
 * @returns False or Number(input)
 */
export declare function isNumber(num: string): number | false;
/** Returns exactly what's passed to it. Useful for higher-order functions. */
export declare function identity<T>(arg: T): T;
/**
 * Wraps a callback accepting function in a promise. The callback must have the type
 * specified in StandardCallback, and the wrapped function *MUST* call the callback
 * on all possible code paths.
 */
export declare function promisify<T = any>(f: any, thisContext?: any): (...args: any[]) => Promise<T>;
/**
 * Wraps a promsie in logs that fire immediately before and after the execution of the promise. Returns a new promise.
 *
 * @param {*} logger A logging function that will log the message. E.g. `Logger.system.debug` or `console.log`.
 * @param {string} message A message to be logged. Suffixed with "start" and "end", before and after the promise, respectively.
 * @param {Promise} promise The promise to be wrapped.
 */
export declare const instrumentPromise: (logger: any, message: any, promise: any) => Promise<any>;
/**
 * Composes an array of functions together, producing
 * a new function that is the result of applying each
 * function from right to left on its arguments.
 *
 * @example
 * const add1 = x => x + 1;
 * const multiply3 = x => x * 3
 * const mulityply3Add1 = composeRL(add1, multiply3);
 * mulityply3Add1(4); // => 13
*/
export declare const composeRL: (...fns: any[]) => any;
/**
 * getProp utility - an alternative to lodash.get
 * @author @harish2704, @muffypl, @pi0, @imnnquy
 * @param {Object} object
 * @param {String|Array} path
 * @param {*} defaultVal
 */
export declare function getProp<T = any>(object: any, path: any, defaultVal?: any): T;
export declare function getUniqueName(baseName?: string): string;
export declare function getRandomWindowName(s: string, uuid: string): string;
/**
 * Creates a promise that rejcts after the specified time with
 * the given message.
 */
export declare function timeoutPromise(ms: any, message: string): Promise<{}>;
/**
 * Wraps a promise in another promise that either rejects after the specified number of miliseconds
 * or resolves with the result of the promise.
 */
export declare function wrapWithTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T>;
/**
 * Will determine if a given window is a StackedWindow. Returns true if the window is a
 * StackedWindow, false otherwise
 * @param {FinsembleWindow} win The window to check for StackedWindow
 */
export declare function isStackedWindow(win: any): boolean;
/**
 * Converts an array into a record where the keys are the result of applying the key function
 * to each item in the array, and the values are the items.
 *
 * @param key Either the key whose value you want to become the new index, or a function
 * that returns the new index when given the current value.
 * @param arr An array of values.
 *
 * @example
 * const arr = [{foo: "bar"}, {foo: "bam"}];
 * toRecord("foo", arr) // => {bar: {foo: "bar"}, {bam: {foo: "bam"}}}
 *
 * @example
 * const arr = [{foo: "bar"}, {foo: "bam"}];
 * toRecord(x => x.foo.toUpperCase(), arr) // => {BAR: {foo: "bar"}, {BAM: {foo: "bam"}}}
 */
export declare function toRecord<T>(key: string | ((x: T) => string), arr: T[]): Record<string, T>;
/**
 * Given an object and array of keys as strings,
 * returns a new object copied from the first but
 * with those keys removed.
 */
export declare function removeKeys(obj: any, keys: string[]): any;
/**
 * Deep equal doesn't work properly if the objects aren't exactly equal
 * We have several places in the code that attach extra parameters to bounds objects
 * This function will test equality on bounds for the only left, right, top, bottom, width and height
 * @param {} bounds1
 * @param {*} bounds2
 */
export declare function checkIfBoundsAreEqual(bounds1: any, bounds2: any): boolean;
export {};
