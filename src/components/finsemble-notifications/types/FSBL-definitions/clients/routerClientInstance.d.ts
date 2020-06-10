/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * @introduction
 * <h2>Router Client Instance</h2>
 * Exports a single shared instance of the router client.  See {@link RouterClientConstructor} for the complete API definition with examples.
 *
 * Example:
 *
 *	// get a shared instance of RouterClient (shared within the containing component or service)
 *	var RouterClient = require('./routerClientInstance').default;
 *
 * @namespace routerClientInstance
 * @shouldBePublished false
 */
import { IRouterClient } from "./IRouterClient";
/** The logger needs a router client, and the router client needs a logger.
 * To get around this fundamental circular dependency, we pass a reference
 * of the RouterClient to the Logger. Only after this is called will the
 * RouterClient and Logger be ready. If RouterClient is NOT required before
 * the Logger, then this file will be dynamically required at Logger.start().
 */
/** An instance of the IRouterClient interface, (that is, the Router Client).
 * All other clients are built on top of the RouterClient; its API is the
 * primary form of communication between the various components of Finsemble.
 */
declare let RouterClientInstance: IRouterClient;
export default RouterClientInstance;
