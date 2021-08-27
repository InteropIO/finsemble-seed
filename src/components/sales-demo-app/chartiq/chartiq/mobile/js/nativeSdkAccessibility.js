/**
 *	8.1.0
 *	Generation date: 2020-12-14T16:21:56.817Z
 *	Client name: finsemble
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2021/07/20"
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


import { CIQ } from "./nativeSdkBridge.js";
/*
 * Accessibility functionality for both iOS and Android sdk's
 *
 * Used to capture the swipe gesture so the chart quotes will
 * be announced via Talkback or Voiceover
 */
//disable undeclared globals
/*jshint -W117 */
/* global webkit, Hammer */
var RIGHT_SWIPE = "swiperight";
var currentIndex = 0;
function accessibilityMode() {
	var stxx = window.stxx;
	// turn off manageTouchandMouse
	stxx.manageTouchAndMouse = false;
	currentIndex = 0;
	// iOS needs to use Hammerjs
	if (!CIQ.MobileBridge.isAndroid) {
		var myElement = stxx.chart.container;
		var mc = new Hammer(myElement);
		mc.on("swipeleft swiperight", function (event) {
			if (event.type === "swipeleft") {
				accessibilitySwipe(event.type);
			} else if (event.type === "swiperight") {
				accessibilitySwipe(event.type);
			}
		});
	}
}
function accessibilitySwipe(direction) {
	var stxx = window.stxx;
	// make sure index stays within the dataSegement bounds
	// also reset the index if the user zooms in or out
	if (
		currentIndex < 0 ||
		stxx.dataSegmentLength !== stxx.chart.dataSegment.length
	) {
		currentIndex = 0;
		stxx.dataSegmentLength = stxx.chart.dataSegment.length;
	}
	var barIndex = currentIndex;
	if (direction === RIGHT_SWIPE) {
		// account for the end of the dataSegement
		if (barIndex + 1 > stxx.dataSegmentLength - 1) {
			barIndex = stxx.dataSegmentLength - 1;
		} else {
			barIndex++;
		}
	} else {
		// account for the beginning of the dataSegment
		if (barIndex - 1 < 0) {
			barIndex = 0;
		} else {
			barIndex--;
		}
	}
	currentIndex = barIndex;
	var quote = stxx.chart.dataSegment[barIndex];
	// check for nulls
	while (!quote) {
		currentIndex++;
		quote = stxx.chart.dataSegment[currentIndex];
	}
	// get the x/y point for the crosshair
	var barPixel = stxx.pixelFromBar(barIndex);
	var pricePixel = stxx.pixelFromPrice(quote.Close);
	// make sure the crosshair is on and css is active
	stxx.container.classList.add("stx-crosshair-on");
	stxx.mousemoveinner(stxx.resolveX(barPixel), stxx.resolveY(pricePixel));
	var crossX = stxx.controls.crossX,
		crossY = stxx.controls.crossY;
	if (crossX) {
		crossX.style.left = barPixel + "px";
		crossX.style.display = "";
	}
	if (crossY) {
		crossY.style.top = pricePixel + "px";
		crossY.style.display = "";
	}
	stxx.crossYActualPos = pricePixel;
	if (stxx.controls.floatDate) stxx.controls.floatDate.style.visibility = "";
	if (stxx.chart.panel) stxx.updateFloatHRLabel(stxx.chart.panel);
	stxx.floatCanvas.style.display = "block";
	var monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];
	var date = new Date(quote.DT.getTime());
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	// NOTE: Voice accessibility is a little finicky about string structure.
	// Putting some sort of delimiter between each field will allow the voice
	// to give a slight pause and a more natural statement will be given to the user.
	var fullDate = monthNames[monthIndex] + ", " + day + ", " + year;
	if (stxx.layout.interval !== "day") {
		// intraday, tack on time
		var meridiem = "pm";
		var hour = date.getHours();
		if (hour < 10) hour = "0" + hour;
		if (hour < 12) meridiem = "am";
		var minute = date.getMinutes();
		if (minute < 10) minute = "0" + minute;
		fullDate += ", " + hour + ":" + minute + " " + meridiem;
	}
	var fields = [
		fullDate,
		"Close: " + quote.Close,
		"Open: " + quote.Open,
		"High: " + quote.High,
		"Low: " + quote.Low,
		"Volume: " + CIQ.commas(quote.Volume)
	];
	// iOS only allows strings to be passed back to Swift, so just do it for Java as well
	var allFields = fields.join("||");
	if (!CIQ.MobileBridge.isAndroid) {
		webkit.messageHandlers.accessibilityHandler.postMessage(allFields);
	} else {
		return allFields;
	}
}
