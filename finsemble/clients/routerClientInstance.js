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
 *	var RouterClient = require('./routerClientInstance');
 *
 * @namespace routerClientInstance
 * @shouldBePublished false
 */

"use strict";

var RouterClientConstructor = require("./routerClientConstructor");

module.exports = new RouterClientConstructor({ clientName: "RouterClient" });