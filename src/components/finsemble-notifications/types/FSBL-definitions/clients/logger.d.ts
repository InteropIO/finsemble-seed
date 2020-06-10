/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * @introduction
 *
 * <h2>Logger Client</h2>
 *
 * The Logger Client supports very efficient and configurable run-time logging to the <a href=tutorial-CentralLogger.html>Central Logger</a>.
 * Logging has a small performance overhead, so developers can liberally instrument their code with log messages for debugging and diagnostics.
 * By default, only error and warning messages are captured by the Logger, with the other message types (e.g., log, info, debug) disabled.
 * Which message types are enabled or disabled is fully controlled from the <a href=tutorial-CentralLogger.html>Central Logger</a> - this means developers can fully instrument their code once and dynamically enable and disable logging later, as needed, for debugging or field support.
 *
 * The Finsemble team uses the Central Logger to <a href=tutorial-Troubleshooting.html>capture log message for field support</a>.
 * Finsemble customers, building their own Finsemble applications, have the option to do the same.
 *
 * **Note:** The Logger Client **wraps** all console logging (e.g., `console.error`, `console.log`) so these message can also be captured and viewed in the Central Logger, but console logging is never disabled locally. For better performance, we recommend most of your code's instrumentation be based on the Logger Client (e.g., `FSBL.Clients.Logger.debug(...)` instead of the `console.debug(...)`).
 *
 * Using the Logger is similar to using the browser's console for logging (e.g., `console.error` or `console.log`), although the Logger Client is accessed through the FSBL object as shown in the examples below.
 *
 *```javascript
 * 			FSBL.Clients.Logger.error("an error message", anErrorObject);
 * 			FSBL.Clients.Logger.warn("a warning message", object1, object2, object3);
 * 			FSBL.Clients.Logger.log("logging message");
 * 			FSBL.Clients.Logger.info("logging message");
 * 			FSBL.Clients.Logger.log("log message");
 * 			FSBL.Clients.Logger.debug("debug message");
 *```
 * The Logger Client also supports system logging (e.g., `Logger.system.log`) for Finsemble's internal logging. All Finsemble client APIs are in the process of being instrumented to log their entry-point calls and parameters, as shown below.
 *
 *```javascript
 * 			Logger.system.info("RouterClient.transmit", "TO CHANNEL", toChannel, "EVENT", event);
 *```
 * Developers can view all system logging in the Central Logger, although only `Logger.system.info` messages (recording API interactions) are intended for use outside the Finsemble development team.
 *
 *<strong>Note:</strong> Any service can also use the Logger by directing requiring the client. The Logger can immediately be used, but log message will not be transmitted to the Central Logger until `Logger.start()` is invoked (as shown below).
 *```javascript
 *
 * 			var Logger = require("../../clients/logger").default;
 * 			Logger.log("Service Ready");
 * 			Logger.start();
 *```
 * @hideConstructor
 * @shouldBePublished true
 * @class Logger
 * @constructor
 */
export declare var LoggerConstructor: (dependencies?: {
    RouterClient: any;
}) => void;
/** When running unit tests, we don't want to use the real Logger.
 * `window` is an easy indicator of our environment.
 * @TODO - refactor to some sort of global like FSBL.environment. */
export declare const Logger: any;
export default Logger;
