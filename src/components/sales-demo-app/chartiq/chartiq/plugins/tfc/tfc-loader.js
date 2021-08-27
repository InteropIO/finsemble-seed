/**
 *	8.3.99
 *	Generation date: 2021-05-21T20:54:02.745Z
 *	Client name: finsemble
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2022/07/20"
 *	Domain lock: ["127.0.0.1","localhost","chartiq.com","finsemble.com"]
 *	iFrame lock: true
 */

/***********************************************************
 * Copyright by ChartIQ, Inc.
 * Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
*************************************************************/
/*************************************** DO NOT MAKE CHANGES TO THIS LIBRARY FILE!! **************************************/
/* If you wish to overwrite default functionality, create a separate file with a copy of the methods you are overwriting */
/* and load that file right after the library has been loaded, but before the chart engine is instantiated.              */
/* Directly modifying library files will prevent upgrades and the ability for ChartIQ to support your solution.          */
/*************************************************************************************************************************/
/* eslint-disable no-extra-parens */


/*
 *
 * TFC package.  This loads up the Trade From Chart module.
 *
 */
import { CIQ } from "../../js/componentUI.js";
import TFC from "./tfc.js";
import html from "./tfcHtml.js";

var _scss;

if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	_scss = require("./tfc.scss");
} else if (typeof define === "function" && define.amd) {
	define(["./tfc.scss"], function (m1) {
		_scss = m1;
	});
}

function start(config) {
	var stx = config.stx;

	let { account, allowUniqueAccountConstruction } = config;

	const accountIsInstance = typeof account !== "function";

	if (allowUniqueAccountConstruction || accountIsInstance) {
		config.account = accountIsInstance ? account : new account();
	} else {
		TFC.sharedAccount =
			TFC.sharedAccount || (accountIsInstance ? account : new account());
		config.account = TFC.sharedAccount;
	}

	stx.tfc = new TFC(config);

	stx.addEventListener("newChart", function () {
		stx.tfc.changeSymbol();
	});

	var topNode = config.context ? config.context.topNode : document;
	var qs = (path) => topNode.querySelector(path);

	stx.tfc.selectSymbol = function (symbol) {
		if (config.context)
			config.context.changeSymbol({ symbol: symbol.toUpperCase() });
	};

	var sidePanel = qs("cq-side-panel");

	if (!topNode.querySelector("cq-side-panel .stx-trade-panel")) {
		// Add trade panel if markup is not already present in side panel
		sidePanel.appendChild(qs(".stx-trade-panel"));
	}

	if (config.context.config) {
		CIQ.UI.BaseComponent.prototype.channelSubscribe(
			(config.context.config.channels || {}).tfc || "channel.tfc",
			function (isActive) {
				stx.tfc.openPanel(isActive);
			},
			stx
		);
		// Resize side panel based on tradePanel width
		sidePanel.resizeMyself();
	}
}

// Stub function to allow child classes to be defined by the user
CIQ.Account = CIQ.Account || function () {};

// **Note:** The CIQ.TFC documentation is in *plugins/tfc/tfc.js*.
//
// Stub function used to create the plug-in object on the page before the class is loaded.
//
// @param {object} config Parameters for setting up the Trade from Chart plug-in.
// @param {CIQ.ChartEngine} config.stx A reference to the chart engine.
// @param {CIQ.ChartEngine.Chart} config.chart A reference to the chart to which the plug-in is
// 		added.
// @param {CIQ.UI.Context} config.context A reference to the user interface context.
// @param {CIQ.Account} [config.account] Account object for querying a brokerage and placing
// 		trades. If omitted, will be a demo account.
// @param {boolean} [config.loadTemplate] Set to false if the Trade from Chart markup is already
//		present in the document.
// @param {string} [config.htmlTemplate] Markup string to use instead of the default loaded HTML
// 		string.
//
// @since 8.1.0 Added `config.loadTemplate` and `config.htmlTemplate`.
CIQ.TFC = function (config) {
	var tfcConfig = Object.assign({}, config);
	var basePath = CIQ.ChartEngine.pluginBasePath + "tfc/";

	if (tfcConfig.account) {
		CIQ.ensureDefaults(
			typeof tfcConfig.account === "function"
				? tfcConfig.account.prototype
				: tfcConfig.account.constructor.prototype,
			CIQ.Account.prototype
		);
	} else if (!CIQ.Account.Demo) {
		console.warn(
			"The TFC plugin requires account, neither TFC plugin account has been provided " +
				"in the plugin config nor has CIQ.Account.Demo been made available using tfc-demo.js import."
		);
		return;
	} else {
		tfcConfig.account = CIQ.Account.Demo;
	}

	if (config.loadTemplate !== false) {
		// markup is not present in document
		var topNode = config.context ? config.context.topNode : document.body;
		var div = document.createElement("div");

		CIQ.innerHTML(div, config.htmlTemplate || html);
		Array.from(div.children).forEach((ch) =>
			topNode.appendChild(ch.cloneNode(true))
		);
	}

	function cb(err) {
		start(tfcConfig);
	}
	if (_scss) {
		CIQ.addInternalStylesheet(_scss, "tfc.scss");
		cb();
	} else {
		CIQ.loadStylesheet(basePath + "tfc.css", cb);
	}
};

export { TFC };
