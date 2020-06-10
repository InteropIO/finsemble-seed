/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
/** The interface which any logger must implement. This is different from
 * the ICentralLogger interface, which is what any logger compatible with
 * the Central Logging service must implement.*/
/**
 * @introduction
 *
 * <h2>Logger Client</h2>
 *
 * The Logger Client supports very efficient and configurable run-time logging to the <a href=tutorial-CentralLogger.html>Central Logger</a>.
 * Logging has a small performance overhead, so developers can liberally instrument their code with log messages for debugging and diagnostics.
 * Which message types are enabled or disabled is fully controlled from the <a href=tutorial-CentralLogger.html>Central Logger</a> - this means developers can fully instrument their code once and dynamically enable and disable logging later, as needed, for debugging or field support.
 *
 * The Finsemble team uses the Central Logger to <a href=tutorial-Troubleshooting.html>capture log message for field support</a>.
 * You have the option to do the same as you build your smart desktop.
 *
 * **Note:** The Logger Client wraps all console logging (e.g., `console.error`, `console.log`) so these message can also be captured and viewed in the Central Logger, but console logging is never disabled locally. For better performance, we recommend most of your code's instrumentation be based on the Logger Client (e.g., `FSBL.Clients.Logger.debug(...)` instead of the `console.debug(...)`).
 *
 * Using the Logger is similar to using the browser's console for logging (e.g., `console.error` or `console.log`), although the Logger Client is accessed through the FSBL object as shown in the examples below.
 *
 *```javascript
 * FSBL.Clients.Logger.error("an error message", anErrorObject);
 * FSBL.Clients.Logger.warn("a warning message", object1, object2, object3);
 * FSBL.Clients.Logger.log("logging message");
 * FSBL.Clients.Logger.info("logging message");
 * FSBL.Clients.Logger.log("log message");
 * FSBL.Clients.Logger.debug("debug message");
 *```
 * The Logger Client also supports system logging (e.g., `Logger.system.log`) for Finsemble's internal logging.
 *
 *```javascript
 * 			Logger.system.info("RouterClient.transmit", "TO CHANNEL", toChannel, "EVENT", event);
 *```
 * Developers can view all system logging in the Central Logger, although only `Logger.system.info` messages (recording API interactions) are intended for use outside the Finsemble development team.
 *
 *<strong>Note:</strong> Any service can also use the Logger by directing requiring the client. The Logger can immediately be used, but log message will not be transmitted to the Central Logger until `Logger.start()` is invoked (as shown below).
 *```javascript
 * var Logger = require("../../clients/logger").default;
 * Logger.log("Service Ready");
 * Logger.start();
 *```
 * @hideConstructor
 * @shouldBePublished true
 * @class Logger
 * @constructor
 */
export interface ILogger {
    /**
     * Log a dev info message.
     *
     * @param {any} message Zero or more parameters of any type that can be stringified (e.g., string, object).
     *
     * @example
     * FSBL.Clients.Logger.info("some message", parm1, parm2);
     */
    info(...message: any[]): void;
    /**
     * Log a dev debug message.
     *
     * @param {any} message Zero or more parameters of any type that can be stringified (e.g., string, object).
     *
     * @example
     * FSBL.Clients.Logger.debug("some message", parm1, parm2);
     */
    debug(...message: any[]): void;
    /**
     * Log a dev verbose message (an extra level of verbose-debug output)
     *
     * @param {Array.<any>} message Zero or more parameters of any type that can be stringified (e.g., string, object).
     *
     * @example
     * FSBL.Clients.Logger.verbose("some message", parm1, parm2);
     */
    verbose(...message: any[]): void;
    /**
 * Log a dev log message.
 *
 * @param {any} message Parameter of any type that can be stringified (e.g., string, object).
 *
 * @example
 * FSBL.Clients.Logger.log("some message", parm1, parm2);
 */
    log(...message: any[]): void;
    /**
     * Log a dev error message.
     *
     * @param {any} message Parameter of any type that can be stringified (e.g., string, object).
     *
     * @example
     * FSBL.Clients.Logger.error("some message", parm1, parm2);
     */
    error(...message: any[]): void;
    /**
     * Log a dev warning message.
     *
     * @param {any} message Parameter of any type that can be stringified (e.g., string, object).
     *
     * @example
     * FSBL.Clients.Logger.warn("some message", parm1, parm2);
     */
    warn(...message: any[]): void;
}
