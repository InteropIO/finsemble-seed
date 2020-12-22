/**
 *	8.0.0
 *	Generation date: 2020-10-08T11:28:10.884Z
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


/***********************************************************
 * Copyright by ChartIQ, Inc.
 * Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
*************************************************************/
/*************************************** DO NOT MAKE CHANGES TO THIS LIBRARY FILE!! **************************************/
/* If you wish to overwrite default functionality, create a separate file with a copy of the methods you are overwriting */
/* and load that file right after the library has been loaded, but before the chart engine is instantiated.              */
/* Directly modifying library files will prevent upgrades and the ability for ChartIQ to support your solution.          */
/*************************************************************************************************************************/
import {CIQ} from "../js/chartiq.js";



/*
	Deprecated functions - lite
*/

var WARN_INTERVAL = 10000;
/**
 * Warn developer of use of deprecated function.
 *
 * All deprecated functions should be calling this log whenever it is used.
 * Warning will be output to the console up to 10 seconds after it is logged, in order to help suppress duplicates.
 *
 * @param {string} message Message to output
 * @private
 */
var warnings = null;
CIQ.deprecationWarning = function (message) {
	if (!warnings) {
		warnings = {};
		setInterval(function () {
			for (var m in warnings) {
				console.warn(m + " (" + warnings[m] + " occurrences)");
				delete warnings[m];
			}
		}, WARN_INTERVAL);
	}
	if (!warnings[message]) warnings[message] = 1;
	else warnings[message]++;
};

var log = CIQ.deprecationWarning;

/* Function.ciqInheritsFrom, Function.stxInheritsFrom */
if (!Function.prototype.ciqInheritsFrom) {
	/**
	 * The built-in Function object.
	 * @external Function
	 * @see [Function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function} on the Mozilla Developer Network.
	 */

	/**
	 * **Deprecated since 7.4.0.** Use {@link CIQ.inheritsFrom} instead.
	 *
	 * Template for JavaScript inheritance.
	 *
	 * By default the constructor (ctor) is called with no arguments.
	 *
	 * @param {object} ctor The parent class or object.
	 * @param {boolean} [autosuper=true] Set to false to prevent the base class constructor from being called automatically.
	 * @memberof external:Function
	 * @alias external:Function#ciqInheritsFrom
	 * @deprecated As of 7.4.0. Use {@link CIQ.inheritsFrom} instead.
	 */
	Function.prototype.ciqInheritsFrom = function (ctor, autosuper) {
		log(
			"Function.prototype.ciqInheritsFrom() has been deprecated.  Use CIQ.inheritsFrom(me, ctor, autosuper) instead."
		);
		CIQ.inheritsFrom(this, ctor, autosuper);
	};
	Function.prototype.stxInheritsFrom = Function.prototype.ciqInheritsFrom; // backward compatibility
}

/**
 * The built-in String object.
 * @external String
 * @see [String]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String} on the Mozilla Developer Network.
 */

/**
 * **Deprecated since 7.4.0.** Use {@link CIQ.capitalize} instead.
 *
 * Capitalizes the first letter of a string.
 *
 * @return {string} Capitalized version of the string.
 * @memberof external:String
 * @alias external:String#capitalize
 * @deprecated As of 7.4.0. Use {@link CIQ.capitalize} instead.
 */
String.prototype.capitalize = function () {
	log(
		"String.prototype.capitalize() has been deprecated.  Use CIQ.capitalize(string) instead."
	);
	return CIQ.capitalize(this);
};

/**
 * **Deprecated since 7.4.0.** Use native CanvasRenderingContext2D methods such as moveTo(), lineTo() and setLineDash() instead.
 *
 * Dashed line polyfill for the canvas. Note that dashed lines are expensive operations when not supported natively.
 * See {@link external:CanvasRenderingContext2D#stxLine}.
 *
 * @param {number} fromX Starting point of the X-axis.
 * @param {number} fromY Starting point of the Y-axis.
 * @param {number} toX Destination on the X-axis.
 * @param {number} toY Destination on the Y-axis.
 * @param {string[]} pattern Array of stroke patterns.
 * @memberof external:CanvasRenderingContext2D
 * @alias external:CanvasRenderingContext2D#dashedLineTo
 * @deprecated As of 7.4.0. Use native CanvasRenderingContext2D methods such as moveTo(), lineTo() and setLineDash() instead.
 *
 * @example
 * <caption>Native [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D}
 * methods used to draw a horizontal dashed line across the center of the screen:</caption>
 * var canvas = stxx.chart.backgroundCanvas;
 * var ctx = canvas.getContext("2d");
 * ctx.beginPath();
 * ctx.setLineDash([10, 10]);
 * ctx.moveTo(0, canvas.height/2);
 * ctx.lineTo(canvas.width, canvas.height/2);
 * ctx.stroke();
 */
CanvasRenderingContext2D.prototype.dashedLineTo = function (
	fromX,
	fromY,
	toX,
	toY,
	pattern
) {
	log(
		"CanvasRenderingContext2D.prototype.dashedLineTo() has been deprecated.  Use native CanvasRenderingContext2D methods such as moveTo(), lineTo() and setLineDash() instead."
	);
	// Error check.
	if (!(pattern instanceof Array)) {
		if (pattern)
			console.log(
				'WARNING: Unsupported drawing pattern "' +
					pattern +
					'"; defaulting to "solid"'
			);
		this.stxLine(
			fromX,
			fromY,
			toX,
			toY,
			this.strokeStyle,
			this.globalAlpha,
			this.lineWidth
		);
		return;
	}

	// can't dash if we do not have proper values
	if (
		fromY === Infinity ||
		fromX === Infinity ||
		toY === Infinity ||
		toX === Infinity
	)
		return;

	// Our growth rate for our line can be one of the following:
	// (+,+), (+,-), (-,+), (-,-)
	// Because of this, our algorithm needs to understand if the x-coord and
	// y-coord should be getting smaller or larger and properly cap the
	// values
	// based on (x,y).
	var lt = function (a, b) {
		return a - b <= 0.00000001;
	};
	var gt = function (a, b) {
		return a - b >= -0.00000001;
	};
	var capmin = function (a, b) {
		return Math.min(a, b);
	};
	var capmax = function (a, b) {
		return Math.max(a, b);
	};

	var checkX = { thereYet: gt, cap: capmin };
	var checkY = { thereYet: gt, cap: capmin };

	if (fromY - toY > 0) {
		checkY.thereYet = lt;
		checkY.cap = capmax;
	}
	if (fromX - toX > 0) {
		checkX.thereYet = lt;
		checkX.cap = capmax;
	}

	this.moveTo(fromX, fromY);
	if (isNaN(fromX) || isNaN(fromY)) return;
	var offsetX = fromX;
	var offsetY = fromY;
	var idx = 0,
		dash = true;
	while (!(checkX.thereYet(offsetX, toX) && checkY.thereYet(offsetY, toY))) {
		var ang = Math.atan2(toY - fromY, toX - fromX);
		var len = pattern[idx];

		offsetX = checkX.cap(toX, offsetX + Math.cos(ang) * len);
		offsetY = checkY.cap(toY, offsetY + Math.sin(ang) * len);

		if (dash) this.lineTo(offsetX, offsetY);
		else this.moveTo(offsetX, offsetY);

		idx = (idx + 1) % pattern.length;
		dash = !dash;
	}
};

/**
 * **Deprecated since 7.4.0.** Use native CanvasRenderingContext2D methods such as moveTo() and lineTo() instead.
 *
 * @param {number} fromX Starting point of the X-axis.
 * @param {number} fromY Starting point of the Y-axis.
 * @param {number} toX Destination on the X-axis.
 * @param {number} toY Destination on the Y-axis.
 * @param {string} color CSS-compatible color, such as hex, rgb, rgba or even color names such as "orange".
 * @param {number} opacity The alpha. A number between 0 and 1.
 * @param {number} lineWidth The line width in pixels.
 * @param {number[]} [pattern] An array that contains the number of pixels on and then the number of pixels off.
 *		For instance [1,1] would create a dotted pattern by turning one pixel on and then one pixel off repeatedly.
 * @memberof external:CanvasRenderingContext2D
 * @alias external:CanvasRenderingContext2D#stxLine
 * @deprecated As of 7.4.0. Use native CanvasRenderingContext2D methods such as moveTo() and lineTo() instead.
 *
 * @example
 * <caption>Native [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D}
 * methods used to draw a thick blue line diagonally across the screen:</caption>
 * var canvas = stxx.chart.backgroundCanvas;
 * var ctx = canvas.getContext("2d");
 * ctx.beginPath();
 * ctx.strokeStyle = "blue";
 * ctx.lineWidth = 2;
 * ctx.moveTo(0, 0);
 * ctx.lineTo(canvas.width, canvas.height/2);
 * ctx.stroke();
 */
CanvasRenderingContext2D.prototype.stxLine = function (
	fromX,
	fromY,
	toX,
	toY,
	color,
	opacity,
	lineWidth,
	pattern
) {
	log(
		"CanvasRenderingContext2D.prototype.stxLine() has been deprecated.  Use native CanvasRenderingContext2D methods such as moveTo() and lineTo() instead."
	);
	this.beginPath();
	this.lineWidth = lineWidth;
	this.strokeStyle = color;
	this.globalAlpha = opacity;
	if (pattern && pattern.length) {
		this.dashedLineTo(fromX, fromY, toX, toY, pattern);
	} else {
		this.moveTo(fromX, fromY);
		this.lineTo(toX, toY);
	}
	this.stroke();
	this.closePath();
	this.lineWidth = 1;
};

/**
 * **Deprecated since 7.4.0.** Use native CanvasRenderingContext2D methods such as arc() instead.
 *
 * Add native circle drawing to the canvas.
 *
 * @param  {number} x X-axis position of the center of the circle.
 * @param  {number} y Y-axis position of the center of the circle.
 * @param  {number} radius Radius of the circle.
 * @param  {boolean} filled If true, then the circle is filled.
 * @memberof external:CanvasRenderingContext2D
 * @alias external:CanvasRenderingContext2D#stxCircle
 * @deprecated As of 7.4.0. Use native CanvasRenderingContext2D methods such as arc() instead.
 *
 * @example
 * <caption>Native [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D}
 * methods used to draw a red circle in the center of the screen:</caption>
 * var canvas = stxx.chart.backgroundCanvas;
 * var ctx = canvas.getContext("2d");
 * ctx.beginPath();
 * ctx.fillStyle = "red";
 * ctx.arc(canvas.width/2, canvas.height/2, 100, 0, 2 * Math.PI);
 * ctx.fill();
 */
CanvasRenderingContext2D.prototype.stxCircle = function (x, y, radius, filled) {
	log(
		"CanvasRenderingContext2D.prototype.stxCircle() has been deprecated.  Use native CanvasRenderingContext2D methods such as arc() instead."
	);
	this.beginPath();
	this.arc(x, y, radius, 0, 2 * Math.PI, false);
	if (filled) this.fill();
	this.stroke();
	this.closePath();
};

/**
 * Returns an instance of
 * [XMLHttpRequest]{@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest}.
 *
 * @param {string} url The URL to which the request is sent (not used).
 * @return {object} An XMLHttpRequest instance.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. Use `new XMLHttpRequest()`.
 */
CIQ.getAjaxServer = function (url) {
	log(
		"CIQ.getAjaxServer() has been deprecated.  Use `new XMLHttpRequest` instead."
	);
	return new XMLHttpRequest();
};

/**
 * Converts an onClick event to an ontouchend event. If the device is known to be a touch device then this can be used
 * to change onclick events that are set as attributes (in HTML). ontouchend events are more responsive than onclick events
 * and can improve the user experience. When coding for cross-device implementations it is recommended to use {@link CIQ.safeClickTouch}
 * programmatically rather than using hardcoded attributes
 * @param  {string} id The id of a node containing an onClick attribute
 * @memberof CIQ
 * @deprecated
 * @since 6.0.0 Deprecated
 */
CIQ.convertClickToTouchEnd = function (id) {
	log(
		"CIQ.convertClickToTouchEnd() has been deprecated.  Use CIQ.safeClickTouch() instead."
	);
	var node = document.getElementById(id);
	var s = node.getAttribute("onClick");
	if (s) {
		node.removeAttribute("onClick");
		node.setAttribute("onTouchEnd", s);
	}
};

/**
 * Converts a date to YYYY-MM-DDTHH:MM:SSZ format (UTC).
 *
 * @param {date} dt The JavaScript `Date` object to be converted.
 * @return {string} The date in YYYY-MM-DDTHH:MM:SSZ format.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. Use [Date.prototype.toISOString]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString} method.
 */
CIQ.standardUTCDate = function (dt) {
	log(
		"CIQ.standardUTCDate(dt) has been deprecated.  Use dt.toISOString() instead."
	);
	var m = dt.getUTCMonth() + 1;
	if (m < 10) m = "0" + m;
	var d = dt.getUTCDate();
	if (d < 10) d = "0" + d;
	var h = dt.getUTCHours();
	if (h < 10) h = "0" + h;
	var mn = dt.getUTCMinutes();
	if (mn < 10) mn = "0" + mn;
	var s = dt.getUTCSeconds();
	if (s < 10) s = "0" + s;
	return (
		"" +
		dt.getUTCFullYear() +
		"-" +
		m +
		"-" +
		d +
		"T" +
		h +
		":" +
		mn +
		":" +
		s +
		"Z"
	);
};

/**
 * Determines whether the input date is during daylight saving time (DST).
 *
 * @param {date} [dt] The date to check. If the parameter is omitted, the current date is used.
 * @return {boolean} True for DST, otherwise false.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. This function may return inaccurate results for some
 * 		countries.
 */
CIQ.isDST = function (dt) {
	log("CIQ.isDST() has been deprecated.  Use dt.toISOString() instead.");
	if (!dt) dt = new Date();
	var jan = new Date(dt.getFullYear(), 0, 1);
	var jul = new Date(dt.getFullYear(), 6, 1);
	var stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
	return dt.getTimezoneOffset() != stdOffset;
};

/**
 * Gets the source element for a DOM event.
 *
 * @param {object} [e] The DOM event, if available from the browser. If an event is not
 * 		provided, the window event is used.
 * @return {object} The DOM node that registered the event.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. Use [Event.target]{@link https://developer.mozilla.org/en-US/docs/Web/API/Event/target}.
 */
CIQ.getEventDOM = function (e) {
	log("CIQ.getEventDOM() has been deprecated.  Use `e.target` instead.");
	return e ? e.target : window.event.srcElement;
};

/**
 * Appends a class name to a node if the node doesn't already have that class. Used to
 * control dynamic behavior via CSS.
 *
 * @param {object} node The DOM element to which the class is added.
 * @param {string} className Name of the class to add to the DOM element.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. Use [Element.classList.add(className)]{@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add}.
 *
 * @example
 * // Apply an "active" css look to an object.
 * CIQ.appendClassName(myNode, "active");
 */
CIQ.appendClassName = function (node, className) {
	log(
		"CIQ.appendClassName() has been deprecated.  Use `node.classList.add(className)` instead."
	);
	if (!node) return;
	if (node.className == className) return; // already a class
	var s = node.className.split(" ");
	for (var i = 0; i < s.length; i++) {
		if (s[i] == className) return; // already a class
	}
	if (!node.className) node.className = className;
	else node.className += " " + className;
};

/**
 * Removes a class name from a DOM node.
 *
 * @param {object} node The DOM element from which the class name is removed.
 * @param {string} className The class name to remove.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. Use [Element.classList.remove(className)]{@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove}.
 */
CIQ.unappendClassName = function (node, className) {
	log(
		"CIQ.unappendClassName() has been deprecated.  Use `node.classList.remove(className)` instead."
	);
	if (!node) return;
	if (node.className.indexOf(className) == -1) return;
	if (node.className == className) {
		node.className = "";
	} else {
		var s = node.className.split(" ");
		var newClassName = "";
		for (var i = 0; i < s.length; i++) {
			if (s[i] == className) continue;
			if (newClassName !== "") newClassName += " ";
			newClassName += s[i];
		}
		node.className = newClassName;
	}
};

/**
 * Convenience method for swapping two class names on a DOM node. Typically used to change
 * state.
 *
 * @param {object} node The DOM element on which the class names are swapped.
 * @param {string} newClassName The class name to swap in.
 * @param {string} oldClassName The class name to swap out.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. Use [Element.classList.replace(oldClassName, newClassName)]{@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/replace}.
 */
CIQ.swapClassName = function (node, newClassName, oldClassName) {
	log(
		"CIQ.swapClassName() has been deprecated.  Use `node.classList.replace(oldClassName, newClassName)` instead."
	);
	CIQ.unappendClassName(node, oldClassName);
	CIQ.appendClassName(node, newClassName);
};

/**
 * Determines whether a class name is currently assigned to a DOM element.
 *
 * @param {object} node The DOM node checked for the presence of the class name.
 * @param {string} className The class name for which to check.
 * @return {boolean} True, if the class name is currently assigned to the DOM element;
 * 		otherwise, false.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. Use [Element.classList.contains(className)]{@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains}.
 */
CIQ.hasClassName = function (node, className) {
	log(
		"CIQ.hasClassName() has been deprecated.  Use `node.classList.contains(className)` instead."
	);
	if (!node) return false;
	if ((" " + node.className + " ").indexOf(" " + className + " ") > -1)
		return true;
	return false;
};

/**
 * Toggles the class name on or off on a DOM element.
 *
 * @param {HTMLElement} node The DOM element on which the class name is toggled on or off.
 * @param {string} className The class name to toggle on or off.
 *
 * @memberof CIQ
 * @deprecated As of 8.0.0. Use [Element.classList.toggle(className)]{@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle}.
 */
CIQ.toggleClassName = function (node, className) {
	log(
		"CIQ.toggleClassName() has been deprecated.  Use `node.classList.toggle(className)` instead."
	);
	if (CIQ.hasClassName(node, className)) CIQ.unappendClassName(node, className);
	else CIQ.appendClassName(node, className);
};

/*
 * http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 */

(function () {
	var attachEvent = document.attachEvent;
	var isIE = navigator.userAgent.match(/Trident/);
	var requestFrame = (function () {
		var raf =
			window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			function (fn) {
				return setTimeout(fn, 20);
			};
		return function (fn) {
			return raf(fn);
		};
	})();

	var cancelFrame = (function () {
		var cancel =
			window.cancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.clearTimeout;
		return function (id) {
			return cancel(id);
		};
	})();

	function resizeListener(e) {
		var win = e.target || e.srcElement;
		if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
		win.__resizeRAF__ = requestFrame(function () {
			var trigger = win.__resizeTrigger__;
			trigger.__resizeListeners__.forEach(function (fn) {
				fn.call(trigger, e);
			});
		});
	}

	function objectLoad(e) {
		this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
		this.contentDocument.defaultView.addEventListener("resize", resizeListener);
	}

	/**
	 * **Deprecated since 7.4.0.** Use {@link CIQ.UI.addResizeListener} instead.
	 *
	 * Attaches a callback to listen for resize events on the DOM.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with
	 * and customize the Web Components can be found here: {@tutorial Web Component Interface}.
	 *
	 * @param {node} element The node to which the listener is attached.
	 * @param {function} callback The listener function to attach to the DOM element.
	 * @memberof CIQ
	 * @deprecated As of 7.4.0. Use {@link CIQ.UI.addResizeListener}.
	 */
	CIQ.addResizeListener = function (element, fn) {
		log(
			"CIQ.addResizeListener() has been deprecated.  Use CIQ.UI.addResizeListener() instead."
		);
		var uiManager = document.querySelector("cq-ui-manager");
		if (uiManager.length > 0) {
			uiManager = uiManager[0];
			uiManager.registerForResize(element);
		}
		if (!element.__resizeListeners__) {
			element.__resizeListeners__ = [];
			if (attachEvent) {
				element.__resizeTrigger__ = element;
				element.attachEvent("onresize", resizeListener);
			} else {
				//if (!getComputedStyle(element) || getComputedStyle(element).position == 'static') element.style.position = 'relative';
				var obj = (element.__resizeTrigger__ = document.createElement(
					"object"
				));
				obj.setAttribute(
					"style",
					"visibility:hidden; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1; border:0px;"
				);
				obj.__resizeElement__ = element;
				obj.onload = objectLoad;
				obj.type = "text/html";
				if (isIE) element.appendChild(obj);
				obj.data = "about:blank";
				if (!isIE) element.appendChild(obj);
			}
		}
		element.__resizeListeners__.push(fn);
	};

	/**
	 * Removes an attached resize event listener from a DOM element.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}.
	 * A full tutorial on how to work with and customize the Web Components can be found here: {@tutorial Web Component Interface}.
	 *
	 * @param {node} element The node from which the listener is removed.
	 * @param {function} callback The listener function to be removed.
	 * @memberof CIQ
	 * @deprecated As of 7.4.0. Use {@link CIQ.UI.removeResizeListener}.
	 */
	CIQ.removeResizeListener = function (element, fn) {
		log(
			"CIQ.removeResizeListener() has been deprecated.  Use CIQ.UI.removeResizeListener() instead."
		);
		var uiManager = document.querySelector("cq-ui-manager");
		if (uiManager.length > 0) {
			uiManager = uiManager[0];
			uiManager.unregisterForResize(element);
		}
		element.__resizeListeners__.splice(
			element.__resizeListeners__.indexOf(fn),
			1
		);
		if (!element.__resizeListeners__.length) {
			if (attachEvent) element.detachEvent("onresize", resizeListener);
			else {
				element.__resizeTrigger__.contentDocument.defaultView.removeEventListener(
					"resize",
					resizeListener
				);
				element.__resizeTrigger__ = !element.removeChild(
					element.__resizeTrigger__
				);
			}
		}
	};
})();

/**
 * This function is no longer used by the library. Use {@link CIQ.Renderer#adjustYAxis} instead.
 * @memberof CIQ.Renderer
 * @deprecated As of 5.2.0. no longer used in library..
 */
CIQ.Renderer.prototype.performCalculations = function () {
	log(
		"CIQ.Renderer.prototype.performCalculations has been deprecated.  Use CIQ.Renderer.prototype.adjustYAxis instead."
	);
};

/**
 * **Deprecated**  Use {@link CIQ.ChartEngine.XAxis#noDraw} and {@link CIQ.ChartEngine.YAxis#noDraw} instead.
 *
 * Override this function to hide the date which floats along the X axis when crosshairs are enabled. Return `true` to hide the date or `false` to display.
 * @memberof CIQ.ChartEngine
 * @deprecated as of 6.0.0 no longer used in library.
 */
CIQ.ChartEngine.hideDates = function () {
	log(
		"CIQ.Renderer.hideDates is no longer supported.  To hide an axis, set its noDraw property.  To hide the floating date label, set stxx.controls.floatDate=null."
	);
	return false;
};

/**
 * Returns true if the chartType displays OHL data.
 * @param  {string} chartType The chart type (layout.chartType)
 * @return {boolean} True if the chart type only displays close values
 * @memberof CIQ.ChartEngine
 * @since 05-2016-10.1 "baseline_delta_mountain" and "colored_mountain" are also available.
 * @deprecated
 */
CIQ.ChartEngine.chartShowsHighs = function (chartType) {
	log(
		"CIQ.ChartEngine.prototype.chartShowsHighs has been deprecated.  Use CIQ.ChartEngine.Chart.prototype.highLowBars instead."
	);
	if (
		{
			line: 1,
			colored_line: 1,
			mountain: 1,
			colored_mountain: 1,
			baseline_delta: 1,
			baseline_delta_mountain: 1,
			histogram: 1,
			scatterplot: 1,
			step: 1,
			colored_step: 1
		}[chartType] == 1
	)
		return false;
	return true;
};

/**
 * Draws a filled rectangle on the chart.
 *
 * @param {number} left The x-axis coordinate of the starting point of the rectangle.
 * @param {number} width The width of the rectangle.
 * @param {number} top The y-axis coordinate of the starting point of the rectangle.
 * @param {number} height The height of the rectangle.
 * @param {string} className A CSS class name used to set the fill color of the rectangle.
 * @param {external:CanvasRenderingContext2D} [context] The canvas context on which the
 * 		rectangle is drawn. If this parameter is not provided, the chart context is used.
 *
 * @memberOf CIQ.ChartEngine
 * @deprecated As of 8.0.0. Use [CanvasRenderingContext2D.fillRect()]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillRect}.
 */
CIQ.ChartEngine.prototype.createBlock = function (
	left,
	width,
	top,
	height,
	className,
	context
) {
	log(
		"CIQ.ChartEngine.prototype.createBlock has been deprecated.  Use native canvas context operation fillRect instead."
	);
	if (!context) context = this.chart.context;
	if (typeof height == "undefined") {
		return;
	}
	this.canvasColor(className, context);
	context.fillRect(left, top, width, height);
	context.globalAlpha = 1;
};

/**
 * Turns the volume underlay indicator on or off.
 *
 * @param {boolean} data True to turn on the underlay, false to turn it off.
 *
 * @memberof CIQ.ChartEngine
 * @deprecated As of 8.0.0. To enable a volume underlay, use {@link CIQ.Studies.addStudy};
 * 		to disable a volume underlay, {@link CIQ.Studies.removeStudy}.
 */
CIQ.ChartEngine.prototype.setVolumeUnderlay = function (data) {
	log(
		"CIQ.ChartEngine.prototype.setVolumeUnderlay is no longer supported.  To enable a volume underlay, use CIQ.Studies.addStudy(stxx, 'vol undr').  To disable, use CIQ.Studies.removeStudy."
	);
	this.layout.volumeUnderlay = data;
	if (this.chart.canvas) this.draw();
	this.changeOccurred("layout");
};

/**
 * Exports all of the drawings on the chart(s) so that they can be saved to an external database and later reconstructed.
 *
 * Note: This function has been renamed {@link CIQ.ChartEngine#exportDrawings}.
 *
 * @see {@link CIQ.ChartEngine#exportDrawings}
 * @see {@link CIQ.ChartEngine#importDrawings}
 * @return {array} An array of objects representing each drawing
 * @memberof CIQ.ChartEngine
 * @deprecated since 3.0.0
 */
CIQ.ChartEngine.prototype.serializeDrawings = function () {
	log(
		"CIQ.ChartEngine.prototype.serializeDrawings has been deprecated.  Use CIQ.ChartEngine.prototype.exportDrawings instead."
	);
	return this.exportDrawings();
};

/**
 * Imports drawings from an array originally created by {@link CIQ.ChartEngine#serializeDrawings}.
 *
 * Note: This function and serializeDrawings have been renamed {@link CIQ.ChartEngine#importDrawings} and {@link CIQ.ChartEngine#exportDrawings} respectively.
 *
 * To immediately render the reconstructed drawings, you must call `draw()`.
 * See {@tutorial Using and Customizing Drawing Tools} for more details.
 * @see {@link CIQ.ChartEngine#exportDrawings}
 * @see {@link CIQ.ChartEngine#importDrawings}
 * @param  {array} arr An array of serialized drawings
 * @memberof CIQ.ChartEngine
 * @deprecated since 4.0.0
 */
CIQ.ChartEngine.prototype.reconstructDrawings = function (arr) {
	log(
		"CIQ.ChartEngine.prototype.reconstructDrawings has been deprecated.  Use CIQ.ChartEngine.prototype.importDrawings instead."
	);
	this.importDrawings(arr);
};

// @deprecated Use pixelFromBar
CIQ.ChartEngine.prototype.computePosition = function (x, offset) {
	log(
		"CIQ.ChartEngine.prototype.computePosition has been deprecated.  Use CIQ.ChartEngine.prototype.pixelFromBar instead."
	);
	if (typeof offset == "undefined") offset = 0;
	var position = x * this.layout.candleWidth + offset + this.micropixels;
	return position;
};

// @deprecated
CIQ.ChartEngine.prototype.computeColor = function (open, close) {
	log(
		"CIQ.ChartEngine.prototype.computeColor has been deprecated.  There is no suggested alternative."
	);
	if (open < close) return "stx_candle_up";
	if (open > close) return "stx_candle_down";
	return "stx_candle_shadow";
};

// @deprecated
CIQ.ChartEngine.prototype.computeLength = function (high, low) {
	log(
		"CIQ.ChartEngine.prototype.computeLength has been deprecated.  Use CIQ.ChartEngine.prototype.pixelFromPrice to compute values and find the difference."
	);
	var h = this.pixelFromPrice(high);
	var l = this.pixelFromPrice(low);
	return l - h;
};

// deprecated
CIQ.ChartEngine.prototype.setCrosshairColors = function () {
	log(
		"CIQ.ChartEngine.prototype.setCrosshairColors is no longer supported.  Use CSS to set the crosshair color"
	);
};

/**
 * A version of {@link CIQ.ChartEngine#valueFromPixel} that will untransform a transformation such as a comparison chart.
 * @param  {number} y	  The y pixel location
 * @param  {CIQ.ChartEngine.Panel} panel A panel object. It is strongly recommended to pass the panel! (see {@link CIQ.ChartEngine#valueFromPixel})
 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yaxis to use. Defaults to panel.yAxis.
 * @return {number}		  The price or value
 * @memberof CIQ.ChartEngine
 * @deprecated Use {@link CIQ.ChartEngine#valueFromPixel} instead
 */
CIQ.ChartEngine.prototype.valueFromPixelUntransform = function (
	y,
	panel,
	yAxis
) {
	log(
		"CIQ.ChartEngine.prototype.valueFromPixelUntransform has been deprecated.  Use CIQ.ChartEngine.prototype.valueFromPixel instead."
	);
	return this.valueFromPixel(y, panel, yAxis);
};

/**
 * > ** This function has been deprecated in favor of {@link CIQ.ChartEngine#pixelFromPrice}. It should no longer be used.
 * > <br>Use {@link CIQ.ChartEngine#pixelFromTransformedValue} to get the pixel location based on the transformed value (percentage comparison change, for example).
 *
 * @param  {number} price	  The price or value
 * @param  {CIQ.ChartEngine.Panel} panel A panel object (see {@link CIQ.ChartEngine#pixelFromPrice})
 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yaxis to use
 * @return {number}		  The y axis pixel location
 * @memberof CIQ.ChartEngine
 * @deprecated Use {@link CIQ.ChartEngine#pixelFromPrice} instead
 * @since 4.0.0 Now behaves like pixelFromPriceTransform. That is, on a comparison chart, pixelFromPrice accepts an actual stock price, not a percentage value.
 */
CIQ.ChartEngine.prototype.pixelFromPriceTransform = function (
	price,
	panel,
	yAxis
) {
	log(
		"CIQ.ChartEngine.prototype.pixelFromPriceTransform has been deprecated.  Use CIQ.ChartEngine.prototype.pixelFromPrice instead."
	);
	return this.pixelFromPrice(price, panel, yAxis);
};

//deprecated, use static version
CIQ.ChartEngine.prototype.isDailyInterval = function (interval) {
	log(
		"CIQ.ChartEngine.prototype.isDailyInterval has been deprecated. Use CIQ.ChartEngine.isDailyInterval instead."
	);
	return CIQ.ChartEngine.isDailyInterval(interval);
};

/**
 * Renders a chart for a particular instrument from the data passed in or fetches new data from the attached {@link quotefeed}.
 *
 * 	This method has been deprecated, use {@link CIQ.ChartEngine#loadChart}.
 *
 * @param  {string|object}		symbol				The symbol or equation for the new chart - a symbol string, equation or an object representing the symbol can be used.
 * 													<br>After the new chart is initialized, it will contain both a symbol string (stxx.chart.symbol) and a symbol object (stxx.chart.symbolObject).
 * 													<br>You can send anything you want in the symbol object, but you must always include at least a 'symbol' element. Both these variables will be available for use wherever the {@link CIQ.ChartEngine.Chart} object is present. For example, if using a {@link quotefeed} for gathering data, params.stx.chart.symbolObject will contain your symbol object.
 * 													<br>To allow equations to be used on a chart, the {@link CIQ.ChartEngine#allowEquations} parameter must be set to `true` and the equation needs to be preceded by an equals sign (=) in order for it to be parsed as an equation.
 * 													<br>See {@link CIQ.formatEquation} and {@link CIQ.computeEquationChart} for more details on allowed equations syntax.
 * @param  {array}					[masterData]		An array of [properly formatted OHLC objects]{@tutorial InputDataFormat} to create a chart. Each element should at a minimum contain a "Close" field (capitalized).
 *													If the charting engine has been configured to use a [QuoteFeed]{@link CIQ.ChartEngine#attachQuoteFeed}
 *													then masterData does not need to be passed in. The quote feed will be queried instead.
 * @param  {CIQ.ChartEngine.Chart}	chart]		Which chart to create. Defaults to the default chart.
 * @param {function}				[cb]					Callback when newChart is loaded. See {@tutorial Adding additional content on chart} for a tutorial on how to use this callback function.
 * @param {object} 					[params] 			Parameters to dictate initial rendering behavior
 * @param {Object} 					[params.range]				Default range to be used upon initial rendering. If both `range` and `span` parameters are passed in, range takes precedence. If periodicity is not set, the range will be displayed at the most optimal periodicity. See {@link CIQ.ChartEngine#setRange} for complete list of parameters this object will accept.
 * @param {object} 					[params.span]				Default span to display upon initial rendering. If both `range` and `span` parameters are passed in, range takes precedence. If periodicity is not set, the span will be displayed at the most optimal periodicity. See {@link CIQ.ChartEngine#setSpan} for complete list of parameters this object will accept.
 * @param {object} 					[params.periodicity]	 	Periodicity to be used upon initial rendering. See {@link CIQ.ChartEngine#setPeriodicity} for complete list of parameters this object will accept. If no periodicity has been set it will default to `1 day`.
 * @param {boolean} 				[params.stretchToFillScreen] Increase the candleWidth to fill the left-side gap created by a small dataSet. Respects <a href="CIQ.ChartEngine.html#preferences%5B%60whitespace%60%5D">CIQ.ChartEngine.preferences.whitespace</a>. Ignored when params `span` or `range` are used. See {@link CIQ.ChartEngine#fillScreen}
 * @memberof CIQ.ChartEngine
 * @example
 * // using a symbol object and embedded span and periodicity requirements
 * stxx.newChart(
 * 	{symbol:newSymbol,other:'stuff'},
 * 	null,
 * 	null,
 * 	callbackFunction,
 * 	{
 * 		span:{base:'day',multiplier:2},
 * 		periodicity:{period:1,interval:5,timeUnit:'minute'},
 * 		stretchToFillScreen:true
 * 	}
 * );
 *
 * @example
 * // using a symbol string
 * stxx.newChart(
 * 	"IBM",
 * 	null,
 * 	null,
 * 	callbackFunction
 * );
 *
 * @example
 * // using an equation string
 * stxx.newChart(
 * 	"=2*IBM-GM",
 * 	null,
 * 	null,
 * 	callbackFunction
 * );
 *
 * @deprecated use {@link CIQ.ChartEngine#loadChart}
 * @since
 * - 2015-11-1 newChart is capable of setting periodicity and span via `params` settings.
 * - 04-2016-08 Added `params.stretchToFillScreen`.
 * - 5.1.0 newChart is capable of setting range via `params` settings.
 * - 6.0.0 Statically provided data will be gap-filled if that functionality is enabled.
 * - 7.0.0 Deprecated, replaced by {@link CIQ.ChartEngine#loadChart}.
 */
CIQ.ChartEngine.prototype.newChart = function (
	symbol,
	masterData,
	chart,
	cb,
	params
) {
	log(
		"CIQ.ChartEngine.prototype.newChart has been deprecated. Use CIQ.ChartEngine.prototype.loadChart instead."
	);
	var parameters = {
		masterData: masterData,
		chart: chart
	};
	CIQ.extend(parameters, params, true);
	// console.log('WARNING: newChart is deprecated for removal. Please use loadChart.');
	return this.loadChart(symbol, parameters, cb);
};

/**
 * Streams "last sale" prices into the chart.
 *
 *
 * >**This function has been deprecated in favor of {@link CIQ.ChartEngine#updateChartData}.
 * This also means that {@link CIQ.ChartEngine#streamParameters.fillGaps} is deprecated.
 * Developers should instead call {@link CIQ.ChartEngine#updateChartData} with `params.fillGaps=true` or rely on cleanupGaps as default behavior.**
 *
 * >`streamTrade` to `updateChartData` migration examples:
 *
 * >Note that updateChartData follows the 'OHLC' format.
 * So `V`olume (upper case) is used rather than `v`olume (lower case).
 * Similarly `L`ast (upper case) is used rather than `l`ast (lower case).
 *
 * >Example 1: streaming a secondary series:
 *
 * >`streamTrade({"last":102.05}, null, "IBM");`
 * <br>Translates to : <br>
 * `updateChartData({"Last":102.05}, null, {fillGaps: true, secondarySeries: "IBM"});`
 *
 * >Example 2: streaming a primary series:
 *
 * >`streamTrade({"last":102.05, "volume":100});`
 * <br>Translates to : <br>
 * `updateChartData({"Last": 102.05,"Volume":100}, null, {fillGaps: true});`
 *
 * This method is designed to append ticks to the master data while maintaining the existing periodicity, appending to the last tick or creating new ticks as needed.
 * It will also fill in gaps if there are missing bars in a particular interval.
 * If a trade has a date older than the beginning of the next bar, the last bar will be updated even if the trade belongs to a prior bar; this could happen if a trade is sent in after hours at a time when the market is closed, or if it is received out of order.
 * When in 'tick' interval, each trade will be added to a new bar and no aggregation to previous bars will be done.
 * If the optional timestamp [now] is sent in, and it is older than the next period to be rendered, the last tick on the dataset will be updated instead of creating a new tick.
 *
 * **It is crucial that you ensure the date/time of the trade is in line with your `masterData` and `dataZone`** See `now` parameter for more details.
 *
 * This method leverages {@link CIQ.ChartEngine#updateChartData} for the actual data insertion into masterData. Please see  {@link CIQ.ChartEngine#updateChartData} for additional details and performance throttle settings.
 *
 * See the [Streaming]{@tutorial DataIntegrationStreaming} tutorial for more the details.
 *
 * **Note:** versions prior to 15-07-01 must use the legacy arguments : streamTrade(price, volume, now, symbol)
 *
 * @param  {object}		data			Price & Volume Data, may include any or all of the following:
 * @param  {number}		data.last 		Last sale price
 * @param  {number}		[data.volume] 	Trade volume
 * @param  {number}		[data.bid] 		Bid price
 * @param  {number}		[data.ask] 		Offer/Ask price
 * @param  {date}		[now]			Date of trade. It must be a java script date [new Date().getTime()]. **If omitted, defaults to "right now" in the set `dataZone`** (see {@link CIQ.ChartEngine#setTimeZone}); or if no `dataZone` is set, it will default to the browser's timezone (not recommended for international client-base since different users will see different times). It is important to note that this value must be in the same timezone as the rest of the masterData already sent into the charting engine to prevent tick gaps or overlaps.
 * @param  {string}		[symbol]		trade symbol for series streaming ONLY. Leave out or set to `null` when streaming the primary chart symbol.
 * @param {object} 		[params] 		Params to be passed to {@link CIQ.ChartEngine#updateChartData}
 * @memberof CIQ.ChartEngine
 * @example
 * // streaming last sale for the primary chart symbol
 * stxx.streamTrade({"last":102.05, "volume":100});
 * @example
 * // streaming last sale for an additional series on the chart
 * stxx.streamTrade({"last":102.05, "volume":100}, null, "IBM");
 * @deprecated Please use {@link CIQ.ChartEngine#updateChartData} for streaming last ticket.
 * @since 4.0.0 Deprecated this function. This also means that streamParameters.fillGaps is deprecated. Developers should
 * call {@link CIQ.ChartEngine#updateChartData} with `params.fillGaps=true` or rely on cleanupGaps as default behavior.
 */
CIQ.ChartEngine.prototype.streamTrade = function (
	priceData,
	now,
	symbol,
	params
) {
	log(
		"CIQ.ChartEngine.prototype.streamTrade has been deprecated. Use CIQ.ChartEngine.prototype.updateChartData instead."
	);
	var chart = this.chart;
	if (!params) params = {};
	if (params.chart) chart = params.chart;
	params.fillGaps = this.streamParameters.fillGaps;
	var newArgs = typeof priceData == "object";

	var price = newArgs ? priceData.last : arguments[0],
		volume = newArgs ? priceData.volume : arguments[1],
		bid = newArgs ? priceData.bid : null,
		ask = newArgs ? priceData.ask : null;

	if (!newArgs) {
		now = arguments[2];
		symbol = arguments[3];
	}

	if (symbol) {
		//series element
		params.secondarySeries = symbol;
	}

	var data = {
		DT: now,
		Last: price,
		Volume: volume,
		Bid: bid,
		Ask: ask
	};

	this.updateChartData(data, chart, params);
};

/**
 * As of version 5.1, his method has been **deprecated** in favor of {@link CIQ.ChartEngine#updateChartData} which provides improved functionality.
 *
 * The following parameters are only applicable for legacy versions (pre 5.1):
 * @deprecated Please use {@link CIQ.ChartEngine#updateChartData}
 * @param  {array/object} appendQuotes		An array of properly formatted OHLC quote object(s). [See Data Format]{@tutorial InputDataFormat}.<br>
 * 											Or a last sale object with the following elements:
 * @param  {number}	appendQuotes.Last 		Last sale price
 * @param  {number}	[appendQuotes.Volume]	Trade volume
 * @param  {number}	[appendQuotes.Bid] 		Bid price
 * @param  {number}	[appendQuotes.Ask] 		Offer/Ask price
 * @param  {number}	[appendQuotes.DT] 		Date of trade.
 * It must be a java script date [new Date().getTime()].
 * **If omitted, defaults to "right now" in the set `dataZone`** (see {@link CIQ.ChartEngine#setTimeZone});
 * or if no `dataZone` is set, it will default to the browser's timezone (not recommended for international client-base since different users
 * will see different times). It is important to note that this value must be in the same timezone as the rest of the masterData already
 * sent into the charting engine to prevent tick gaps or overlaps.
 * @param  {CIQ.ChartEngine.Chart}			[chart]				The chart to append the quotes. Defaults to the default chart.
 * @param {object} [params] Parameters to dictate behavior
 * @param {boolean} [params.noCreateDataSet] If true then do not create the data set automatically, just add the data to the masterData
 * @param {boolean} [params.allowReplaceOHL] Set to true to bypass internal logic that maintains OHL
 * @param {boolean} [params.bypassGovernor] If true then masterdata will be immediately updated regardless of {@link CIQ.ChartEngine#streamParameters}
 * @param {boolean} [params.fillGaps] If true then {@link CIQ.ChartEngine#doCleanupGaps} is called using the {@link CIQ.ChartEngine#cleanupGaps} setting. This will ensure gaps will be filled in the master data from the last tick in the chart to the date of the trade.<BR> Reminder: `tick` does not fill any gaps as it is not a predictable interval.
 * @param {boolean} [params.secondarySeries] Set to the name of the element ( valid comparison symbol, for example) to load data as a secondary series.
 * @param {boolean} [params.useAsLastSale] If not using a 'last sale' formatted object in `appendQuotes`,
 * you can simply set this parameter to `true` to force the data as a last sale price; or further define it by creating an object including other settings as needed.
 * This option is available in cases when a feed may always return OHLC formatted objects or a 'Close' field instead of a 'Last' field,
 * even for last sale streaming updates.
 * By definition a 'last' sale can only be a single record indicating the very 'last' sale price. As such, even if multiple records are sent in the `appendQuotes` array when this flag is enabled,
 * only the last record's data will be used. Specifically the 'Close' and 'Volume' fields will be streamed.
 * @param {boolean} [params.useAsLastSale.aggregatedVolume] If your last sale updates send current volume for the bar instead of just the trade volume, set this parameter to 'true' in the `params.useAsLastSale` object. The sent in volume will be used as is instead of being added to the existing bar's volume.
 *
 * @memberof CIQ.ChartEngine
 * @since
 * - 2015-11-1 Added `params.bypassGovernor` and `params.allowReplaceOHL`.
 * - 2015-11-1 Deprecated `params.force`. Every call will update the tick to maintain the proper volume, and `createDataSet` is now controlled by `sp.maxTicks`, `sp.timeout`, or `params.bypassGovernor`.
 * - 3.0.0 Now `appendQuotes` also takes last sale data to allow streaming capabilities. This can now be used instead of streamTrade.
 * - 3.0.0 New `params.fillGaps`, `params.secondarySeries`, and `params.useAsLastSale`.
 * - 4.0.0 Last sale streaming will now update a bar in the past to comply with the date sent in instead of just updating the current tick.
 * - 4.0.3 Added `params.useAsLastSale.aggregatedVolume`.
 * - 5.0.1 Now calls doCleanupDates in case is is being called directly when not using a quoteFeed, to update an entire candle.
 */
CIQ.ChartEngine.prototype.appendMasterData = function (
	appendQuotes,
	chart,
	params
) {
	log(
		"CIQ.ChartEngine.prototype.appendMasterData has been deprecated. Use CIQ.ChartEngine.prototype.updateChartData instead."
	);
	this.updateChartData(appendQuotes, chart, params);
};

/**
 * <span class="injection">INJECTABLE</span>
 * **Legacy** function to set the periodicity and interval for the chart.
 *
 * **Replaced by {@link CIQ.ChartEngine#setPeriodicity}, but maintained for backwards comparibility. Uses same function signature.**
 *
 * @param {number} period The number of elements from masterData to roll-up together into one data point on the chart (one candle, for example). If set to 30 in a candle chart, for example, each candle will represent 30 raw elements of `interval` type.
 * @param {string} interval The type of data to base the `period` on. This can be a numeric value representing minutes, seconds or millisecond as inicated by `timeUnit`, "day","week", "month" or 'tick' for variable time x-axis. **"hour" is NOT a valid interval.** (This is not how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
 * @param {string} [timeUnit] Time unit to further qualify the specified numeric interval. Valid values are "millisecond","second","minute",null. If not set, will default to "minute". **only applicable and used on numeric intervals**
 * @param {function} [cb] Callback after periodicity is changed. First parameter of callback will be null unless there was an error.
 *
 * @memberof CIQ.ChartEngine
 * @since
 * - 2015-11-1 Second and millisecond periodicities are now supported by setting the `timeUnit` parameter.
 * - 3.0.0 Replaced by {@link CIQ.ChartEngine#setPeriodicity}, but maintained for backwards comparibility.
 * - 8.0.0 Deprecated
 * @deprecated Use {@link CIQ.ChartEngine#setPeriodicity}.
 */
CIQ.ChartEngine.prototype.setPeriodicityV2 = function (
	period,
	interval,
	timeUnit,
	cb
) {
	log(
		"CIQ.ChartEngine.prototype.setPeriodicityV2 has been deprecated. Use CIQ.ChartEngine.prototype.setPeriodicity instead."
	);
	if (typeof timeUnit === "function") {
		cb = timeUnit; // backward compatibility
		timeUnit = null;
	}
	if (this.runPrepend("setPeriodicityV2", arguments)) return;
	this.setPeriodicity(period, interval, timeUnit, cb);
	this.runAppend("setPeriodicityV2", arguments);
};

//Unused
CIQ.ChartEngine.prototype.addChart = function (name, chart) {
	log(
		"CIQ.ChartEngine.prototype.addChart has been deprecated. Add manually to stxx.charts object instead."
	);
	chart.name = name;
	this.charts[name] = chart;
};

var changeOccurred = CIQ.ChartEngine.prototype.changeOccurred;
CIQ.ChartEngine.prototype.changeOccurred = function (change) {
	if (this.currentlyImporting) return;
	if (this.changeCallback) this.changeCallback(this, change);
	changeOccurred.call(this, change);
};

var engineConstruct = CIQ.ChartEngine.prototype.construct;
CIQ.ChartEngine.prototype.construct = function () {
	function getValue(obj, name, def) {
		if (!obj._deprecatedPropertyValues) obj._deprecatedPropertyValues = {};
		if (!(name in obj._deprecatedPropertyValues))
			obj._deprecatedPropertyValues[name] = def;
		return obj._deprecatedPropertyValues[name];
	}
	function setValue(obj, name, val) {
		if (!obj._deprecatedPropertyValues) obj._deprecatedPropertyValues = {};
		obj._deprecatedPropertyValues[name] = val;
	}

	engineConstruct.call(this);

	Object.defineProperties(this, {
		/**
		 * **This function has been deprecated. Please use {@link CIQ.ChartEngine#addEventListener} instead.**
		 *
		 * This is the callback function used to react to {@link CIQ.ChartEngine#changeOccurred}.
		 *
		 * Use this for storing chart configurations or drawings real time as users make changes.
		 *
		 * Expected format :
		 *
		 * 		fc(stxChart, eventType);
		 *
		 * Currently implemented values for  "eventType" are "layout" and "vector".
		 *
		 * You can create any additional event types and trigger them by calling 'CIQ.ChartEngine.changeOccurred(eventType)'
		 *
		 * **Note** only one changeCallback function can be registered per chart object. As such, you must program it to handle any and all possible events triggered by {@link CIQ.ChartEngine#changeOccurred}.
		 * @type {function}
		 * @alias changeCallback
		 * @memberof CIQ.ChartEngine.prototype
		 * @deprecated
		 * @since 4.0.0 Deprecated
		 * @example
		 * stxx.changeCallback=function(stxx, eventType){
		 *		if(eventType=="layout") saveLayout();
		 *		if(eventType=="vector") saveDrawing();
		 * }
		 */
		changeCallback: {
			enumerable: true,
			get: (function (stx) {
				return function () {
					//log("CIQ.ChartEngine.prototype.changeCallback has been deprecated.  Use CIQ.ChartEngine.prototype.addEventListener instead.");
					return getValue(this, "changeCallback", null);
				};
			})(this),
			set: (function (stx) {
				return function (func) {
					log(
						"CIQ.ChartEngine.prototype.changeCallback has been deprecated.  Use CIQ.ChartEngine.prototype.addEventListener instead."
					);
					setValue(this, "changeCallback", func);
				};
			})(this)
		},
		/**
		 * Chart types which plot more than one data field (OHLC charts).
		 * Putting a chart type here will disable the use of {@link CIQ.ChartEngine.Chart#defaultPlotField}.
		 * @type object
		 * @default
		 * @alias highLowBars
		 * @deprecated, access property in chart instead (stxx.chart.highLowBars)
		 * @memberof CIQ.ChartEngine.prototype
		 * @since 4.0.0
		 */
		highLowBars: {
			enumerable: true,
			get: (function (stx) {
				return function () {
					log(
						"CIQ.ChartEngine.prototype.highLowBars is no longer supported.  Use CIQ.ChartEngine.Chart.prototype.highLowBars instead."
					);
					return getValue(this, "highLowBars", {
						bar: true,
						colored_bar: true,
						candle: true,
						hollow_candle: true,
						volume_candle: true,
						hlc: true,
						colored_hlc: true,
						hlc_box: true,
						hlc_shaded_box: true,
						wave: true,
						rangechannel: true,
						none: true
					});
				};
			})(this),
			set: (function (stx) {
				return function (val) {
					log(
						"CIQ.ChartEngine.prototype.highLowBars is no longer supported.  Use CIQ.ChartEngine.Chart.prototype.highLowBars instead."
					);
					setValue(this, "highLowBars", val);
				};
			})(this)
		},
		/**
		 * Chart types whose bars represent a stand-alone entity as opposed to a vertex in a line-type chart.
		 * This is important when the engine tries to render the data points right off the chart; in a stand-alone bar,
		 * the points right off the chart need not be considered.
		 * @type object
		 * @default
		 * @alias standaloneBars
		 * @deprecated, access property in chart instead (stxx.chart.standaloneBars)
		 * @memberof CIQ.ChartEngine.prototype
		 * @since 4.0.0
		 */
		standaloneBars: {
			enumerable: true,
			get: (function (stx) {
				return function () {
					log(
						"CIQ.ChartEngine.prototype.standaloneBars is no longer supported.  Use CIQ.ChartEngine.Chart.prototype.standaloneBars instead."
					);
					return getValue(this, "standaloneBars", {
						bar: true,
						colored_bar: true,
						candle: true,
						hollow_candle: true,
						volume_candle: true,
						hlc: true,
						colored_hlc: true,
						hlc_box: true,
						hlc_shaded_box: true,
						histogram: true,
						scatterplot: true
					});
				};
			})(this),
			set: (function (stx) {
				return function (val) {
					log(
						"CIQ.ChartEngine.prototype.standaloneBars is no longer supported.  Use CIQ.ChartEngine.Chart.prototype.standaloneBars instead."
					);
					setValue(this, "standaloneBars", val);
				};
			})(this)
		},
		/**
		 * Chart types whose bars have width, as opposed to a line-type chart whose "bars" are just a point on the chart.
		 * This is useful when the engine adjusts the chart for smooth scrolling and homing.
		 * @type object
		 * @default
		 * @alias barsHaveWidth
		 * @deprecated, access property in chart instead (stxx.chart.barsHaveWidth)
		 * @memberof CIQ.ChartEngine.prototype
		 * @since 4.0.0
		 */
		barsHaveWidth: {
			enumerable: true,
			get: (function (stx) {
				return function () {
					log(
						"CIQ.ChartEngine.prototype.barsHaveWidth is no longer supported.  Use CIQ.ChartEngine.Chart.prototype.barsHaveWidth instead."
					);
					return getValue(this, "barsHaveWidth", {
						bar: true,
						colored_bar: true,
						candle: true,
						hollow_candle: true,
						volume_candle: true,
						hlc: true,
						colored_hlc: true,
						hlc_box: true,
						hlc_shaded_box: true,
						histogram: true,
						scatterplot: true,
						wave: true
					});
				};
			})(this),
			set: (function (stx) {
				return function (val) {
					log(
						"CIQ.ChartEngine.prototype.barsHaveWidth is no longer supported.  Use CIQ.ChartEngine.Chart.prototype.barsHaveWidth instead."
					);
					setValue(this, "barsHaveWidth", val);
				};
			})(this)
		}
	});

	/**
	 * Specify a callback by assigning a function to the event. Once the event triggers the callback will be executed.
	 *
	 * **Note: All callbacks have been deprecated in favor of {@link CIQ.ChartEngine#addEventListener}**
	 *
	 * @type object
	 * @alias callbacks
	 * @memberof CIQ.ChartEngine#
	 * @example
	 * // using event listener
	 * stxx.addEventListener("callbackNameHere", function(callBackParametersHere){
	 * 	CIQ.alert('triggered!');
	 * });
	 * @example
	 * // using callback function
	 * stxx.callbacks.callbackNameHere=function(callBackParametersHere){
	 * 	CIQ.alert('triggered!');
	 * };
	 * @deprecated 4.0.0
	 */
	this.callbacks = {};

	function callbackGetter(name, stx, def) {
		return function () {
			log(
				"CIQ.ChartEngine.prototype.callbacks have been deprecated.  Iterate through CIQ.ChartEngine.prototype.callbackListeners instead."
			);
			return getValue(this, name, def || null);
		};
	}

	function callbackSetter(name, stx) {
		return function (func) {
			log(
				"CIQ.ChartEngine.prototype.callbacks have been deprecated.  Utilize CIQ.ChartEngine.prototype.addEventListener to add a callback, and/or CIQ.ChartEngine.prototype.removeEventListener to remove one."
			);
			if (!this._deprecatedPropertyValues) this._deprecatedPropertyValues = {};
			var origFunc = this._deprecatedPropertyValues[name];
			if (origFunc) stx.removeEventListener(name, origFunc);
			if (func) stx.addEventListener(name, func);
			this._deprecatedPropertyValues[name] = func;
		};
	}

	Object.defineProperties(this.callbacks, {
		/**
		 * Called when a user right clicks on an overlay study. If `forceEdit==true` then a user has clicked
		 * on an edit button (cog wheel) so pull up an edit dialog. Otherwise they have simply right clicked so
		 * give them a context menu.
		 *
		 * ***Please note that this callback must be set *before* you call {@link CIQ.ChartEngine#importLayout}.
		 * Otherwise your imported studies will not have an edit capability***
		 *
		 * Format:<br>
		 * studyOverlayEdit({stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters, forceEdit: forceEdit});
		 *
		 * The following CSS entry must also be present to enable the `Right click to Manage` text on the mouse-over context menu (div class="mSticky" generated by {@link CIQ.ChartEngine#htmlControls}):
		 * ```
		 * .rightclick_study .mouseManageText {
		 * display: inline; }
		 * ```
		 * See {@link CIQ.Studies.addStudy} for more details.
		 *
		 * @type function
		 * @alias callbacks[`studyOverlayEdit`]
		 * @memberof! CIQ.ChartEngine#
		 */
		studyOverlayEdit: {
			enumerable: true,
			get: callbackGetter("studyOverlayEdit", this),
			set: callbackSetter("studyOverlayEdit", this)
		},
		/**
		 * Called when a user clicks the edit button on a study panel.
		 *
		 * ***Please note that this callback should be set *before* you call {@link CIQ.ChartEngine#importLayout}.
		 * Otherwise your imported studies will not have an edit capability***
		 *
		 * Format:<br>
		 * studyPanelEdit({stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters});
		 *
		 * See {@link CIQ.Studies.addStudy} for more details.
		 *
		 * @type function
		 * @alias callbacks[`studyPanelEdit`]
		 * @memberof! CIQ.ChartEngine#
		 */
		studyPanelEdit: {
			enumerable: true,
			get: callbackGetter("studyPanelEdit", this),
			set: callbackSetter("studyPanelEdit", this)
		},
		/**
		 * Called when a user clicks or taps on the chart. Not called if a drawing tool is active!
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
		 * @type function
		 * @alias callbacks[`tap`]
		 * @memberof! CIQ.ChartEngine#
		 * @example
		 * // using event listener
		 * stxx.addEventListener("tap", function(tapObject){
		 * 	CIQ.alert('tap event at x: ' + tapObject.x + ' y: '+ tapObject.y);
		 * });
		 * @example
		 * // using callback
		 * // this example  uses barFromPixel() to get the actual bar from the pixel location
		 * stxx.callbacks.tap= function(tapObject){
		 *	var msg= 'tap event at x: ' + tapObject.x + ' y: '+ tapObject.y;
		 *	var bar=this.barFromPixel(this.cx);
		 *  if(this.chart.dataSegment[bar]) {
		 * 	  msg+=' Date:' + this.chart.dataSegment[bar].DT;
		 * 	  msg+=' Close:' + this.chart.dataSegment[bar].Close;
		 *  }
		 *  alert (msg);
		 * };
		 */
		tap: {
			enumerable: true,
			get: callbackGetter("tap", this),
			set: callbackSetter("tap", this)
		},
		/**
		 * Called when a user clicks or right clicks on the chart. Not called if the user right clicks on a drawing or study
		 * when [stxx.bypassRightClick]{@link CIQ.ChartEngine#bypassRightClick}=true
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
		 * @type function
		 * @alias callbacks[`rightClick`]
		 * @memberof! CIQ.ChartEngine#
		 * @example
		 * // using event listener
		 * stxx.addEventListener("rightClick", function(rcObject){
		 * 	alert('right click event at x: ' + rcObject.x + ' y: '+ rcObject.y);
		 * });
		 * @since 09-2016-19
		 */
		rightClick: {
			enumerable: true,
			get: callbackGetter("rightClick", this),
			set: callbackSetter("rightClick", this)
		},
		/**
		 * Called when a user "long holds" on the chart. By default this is set to 700 milliseconds.
		 * Optionally change the value of stxx.longHoldTime to a different setting, or set to zero to disable.
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
		 * @type function
		 * @alias callbacks[`longhold`]
		 * @memberof! CIQ.ChartEngine#
		 * @example
		 * // using event listener
		 * stxx.longHoldTime=... // Optionally override default value of 700ms
		 * stxx.addEventListener("longhold", function(lhObject){
		 * 	CIQ.alert('longhold event at x: ' + lhObject.x + ' y: '+ lhObject.y);
		 * });
		 * @example
		 * // using callback function
		 * stxx.longHoldTime=... // Optionally override default value of 700ms
		 * stxx.callbacks.longhold=function(lhObject){
		 * 	CIQ.alert('longhold event at x: ' + lhObject.x + ' y: '+ lhObject.y);
		 * });
		 * @memberof! CIQ.ChartEngine#
		 * @since 2016-06-22
		 */
		longhold: {
			enumerable: true,
			get: callbackGetter("longHold", this),
			set: callbackSetter("longHold", this)
		},
		/**
		 * Called when a user moves on the chart. Not called if a drawing tool is active, panel resizing, etc
		 * grab is true if a mouse user has the mouse button down while moving. For touch users it is true
		 * if they do not have the crosshair tool enabled.
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy, grab:boolean})
		 * @type function
		 * @alias callbacks[`move`]
		 * @memberof! CIQ.ChartEngine#
		 */
		move: {
			enumerable: true,
			get: callbackGetter("move", this),
			set: callbackSetter("move", this)
		},
		/**
		 * Called when the layout changes
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, chart:CIQ.ChartEngine.Chart, symbol: String, symbolObject:Object, layout: Object})
		 * @type function
		 * @alias callbacks[`layout`]
		 * @memberof! CIQ.ChartEngine#
		 */
		layout: {
			enumerable: true,
			get: callbackGetter("layout", this),
			set: callbackSetter("layout", this)
		},
		/**
		 * Called when a drawing is added or deleted (all the drawings are returned, not just the new one)
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, symbol: String, symbolObject:Object, drawings: Object})
		 * @type function
		 * @alias callbacks[`drawing`]
		 * @memberof! CIQ.ChartEngine#
		 */
		drawing: {
			enumerable: true,
			get: callbackGetter("drawing", this),
			set: callbackSetter("drawing", this)
		},
		/**
		 * Called when a right-click is detected on a highlighted drawing.
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, drawing:CIQ.Drawing})
		 * @type function
		 * @alias callbacks[`drawingEdit`]
		 * @memberof! CIQ.ChartEngine#
		 * @since 6.2.0
		 */
		drawingEdit: {
			enumerable: true,
			get: callbackGetter("drawingEdit", this),
			set: callbackSetter("drawingEdit", this)
		},
		/**
		 * Called when preferences are changed
		 * calback({stx:CIQ.ChartEngine})
		 * @type function
		 * @alias callbacks[`preferences`]
		 * @memberof! CIQ.ChartEngine#
		 */
		preferences: {
			enumerable: true,
			get: callbackGetter("preferences", this),
			set: callbackSetter("preferences", this)
		},
		/**
		 * Called when a theme is changed
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine})
		 * @type function
		 * @alias callbacks[`theme`]
		 * @memberof! CIQ.ChartEngine#
		 */
		theme: {
			enumerable: true,
			get: callbackGetter("theme", this),
			set: callbackSetter("theme", this)
		},
		/**
		 * Called when the symbol is changed (when loadChart is called), added (addSeries, addStudy) or removed (removeSeries, removeStudy). Note
		 * that this is not called if the symbol change occurs during an importLayout
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, symbol: String, symbolObject:Object, action:["master"|"add-series"|"remove-series"})
		 * @type function
		 * @alias callbacks[`symbolChange`]
		 * @memberof! CIQ.ChartEngine#
		 * @since 06-2016-21
		 */
		symbolChange: {
			enumerable: true,
			get: callbackGetter("symbolChange", this),
			set: callbackSetter("symbolChange", this)
		},
		/**
		 * Called when the symbol is first imported into the layout.
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, symbol: String, symbolObject:Object, action:"master"})
		 * @type function
		 * @alias callbacks[`symbolImport`]
		 * @memberof! CIQ.ChartEngine#
		 * @since 4.0.0
		 */
		symbolImport: {
			enumerable: true,
			get: callbackGetter("symbolImport", this),
			set: callbackSetter("symbolImport", this)
		},
		/**
		 * Called to determine how many decimal places the stock trades in.
		 *
		 * This is used for heads up display and also for the current price pointer label.
		 *
		 * By default it is set to {@link CIQ.calculateTradingDecimalPlaces}
		 *
		 * Format:<br>
		 * callback({stx:CIQ.ChartEngine, chart:CIQ.ChartEngine.Chart, symbol: String, symbolObject:Object})
		 *
		 * @type function
		 * @alias callbacks[`calculateTradingDecimalPlaces`]
		 * @memberof! CIQ.ChartEngine#
		 * @deprecated As of 8.0.0. Use {@link CIQ.ChartEngine.Chart#calculateTradingDecimalPlaces}.
		 */
		calculateTradingDecimalPlaces: {
			enumerable: true,
			get: (function (stx) {
				return function () {
					log(
						"CIQ.ChartEngine.prototype.callbacks.calculateTradingDecimalPlaces has been deprecated.  Utilize CIQ.ChartEngine.Chart.prototype.calculateTradingDecimalPlaces instead."
					);
					return getValue(
						this,
						"calculateTradingDecimalPlaces",
						stx.chart.calculateTradingDecimalPlaces
					);
				};
			})(this),
			set: (function (stx) {
				return function (func) {
					log(
						"CIQ.ChartEngine.prototype.callbacks.calculateTradingDecimalPlaces has been deprecated.  Utilize CIQ.ChartEngine.Chart.prototype.calculateTradingDecimalPlaces instead."
					);
					setValue(this, "calculateTradingDecimalPlaces", func);
					stx.chart.calculateTradingDecimalPlaces = func;
				};
			})(this)
		}
	});

	/**
	 * If true then {@link CIQ.ChartEngine#doCleanupGaps} is called so long as {@link CIQ.ChartEngine#cleanupGaps} is also set.
	 * This will ensure gaps will be filled in the master data from the last tick in the chart to the date of the trade.
	 *
	 * **Only applicable when using streamTrade()**.<BR> Reminder: `tick` does not fill any gaps as it is not a predictable interval.
	 *
	 * @type boolean
	 * @default
	 * @alias streamParameters[`fillGaps`]
	 * @memberof! CIQ.ChartEngine#
	 * @since 2016-03-11
	 * @deprecated See deprecation of {@link CIQ.ChartEngine#streamTrade}. Use {@link CIQ.ChartEngine#updateChartData} instead,
	 * with params.fillGaps=true or rely on cleanupGaps as default behavior.
	 */
	// Guard checking existence because this is a prototype object, no redefinition allowed
	Object.defineProperty(this.streamParameters, "fillGaps", {
		enumerable: true,
		get: (function (stx) {
			return function () {
				log(
					"CIQ.ChartEngine.prototype.streamParameters.fillGaps has been deprecated.  Use CIQ.ChartEngine.prototype.updateChartData instead, with params.fillGaps=true or rely on cleanupGaps as default behavior."
				);
				return getValue(this, "fillGaps", true);
			};
		})(this),
		set: (function (stx) {
			return function (val) {
				log(
					"CIQ.ChartEngine.prototype.streamParameters.fillGaps has been deprecated.  Use CIQ.ChartEngine.prototype.updateChartData instead, with params.fillGaps=true or rely on cleanupGaps as default behavior."
				);
				setValue(this, "fillGaps", val);
			};
		})(this)
	});
};

// These namespaces are only available for "legacy" implementations which run in browser and use global namespaces
if (typeof window != "undefined") {
	Object.defineProperties(window, {
		STX: {
			enumerable: true,
			get: function () {
				log("STX namespace has been deprecated.  Use CIQ namespace instead.");
				return CIQ;
			}
		},
		STXChart: {
			enumerable: true,
			get: function () {
				log(
					"STXChart namespace has been deprecated.  Use CIQ.ChartEngine namespace instead."
				);
				return CIQ.ChartEngine;
			}
		}
	});
}



/*
	Deprecated functions - basic
*/

/**
 * ** Deprecated. ** Use {@link CIQ.ChartEngine#attachQuoteFeed} instead.
 * Attaches a quote feed to the charting engine, which causes the chart to pull data from the
 * quote feed as needed.
 *
 * @param {object} [quoteFeed] A quote feed object.
 * @param {object} [behavior] Optional behavior object to initialize tje quote feed.
 * @param {number} [behavior.refreshInterval] Sets the frequency for `fetchUpdateData`. If
 * 		null or zero, `fetchUpdateData` is not called.
 * @param {function} [behavior.callback] Optional callback function called after any fetch to
 * 		enhance functionality. It will be called with the params object used with the fetch
 * 		call.
 * @param {number} [behavior.noLoadMore] If true, the chart does not attempt to load any more
 * 		data after the initial load.
 * @param {boolean} [behavior.loadMoreReplace] If true, then when paginating, the driver
 * 		replaces the master data instead of prepending. Set this if your feed can only provide
 * 		a full data set of varying historical lengths.
 *
 * @memberOf CIQ.ChartEngine
 * @private
 * @since
 * - 2016-12-01
 * - 8.0.0 Deprecated
 * @deprecated Use {@link CIQ.ChartEngine#attachQuoteFeed}.
 *
 * @example
 * <caption>Attach a quote feed and have the driver call <code>fetchUpdateData</code> once per
 * second.</caption>
 * stxx.attachEngineQuoteFeed(yourQuotefeed, {refreshInterval: 1});
 */
CIQ.ChartEngine.prototype.attachEngineQuoteFeed = function (
	quoteFeed,
	behavior
) {
	log(
		"CIQ.ChartEngine.prototype.attachEngineQuoteFeed has been deprecated. Use CIQ.ChartEngine.prototype.attachQuoteFeed instead."
	);
	this.attachQuoteFeed(quoteFeed, behavior);
};

/**
 * **Deprecated since 7.2.0.** Use {@link CIQ.ChartEngine#dragPlotOrAxis} instead.
 *
 * Detects whether the plot (series or study) should be dragged to another panel by examining the y-coordinate of the mouse
 * and seeing if it is either over a different panel than the plot or close to another panel (or the top or bottom edge of the chart).
 * If so, the plot is moved to the new panel.
 *
 * @param {number} cy Y-coordinate to test.
 * @memberof CIQ.ChartEngine
 * @since
 * - 7.1.0
 * - 7.2.0 Removed functionality. Added console warning.
 * @deprecated As of 7.2.0. See {@link CIQ.ChartEngine#dragPlotOrAxis}.
 */
CIQ.ChartEngine.prototype.dragPlot = function (cy) {
	log(
		"CIQ.ChartEngine.prototype.dragPlot is no longer supported.  Use CIQ.ChartEngine.prototype.dragPlotOrAxis instead."
	);
	return;
};

/**
 * **Deprecated since 7.2.0.** Use {@link CIQ.ChartEngine#dragPlotOrAxis} instead.
 *
 * Detects whether the y-axis should be dragged to another position by examining the x-coordinate of the mouse
 * and seeing if the mouse is over a different position than the axis. If so, the axis is moved to the new position.
 *
 * @param {number} cx X-coordinate to test.
 * @memberof CIQ.ChartEngine
 * @since
 * - 7.1.0
 * - 7.2.0 Removed functionality. Added console warning.
 * @deprecated As of 7.2.0. See {@link CIQ.ChartEngine#dragPlotOrAxis}.
 */
CIQ.ChartEngine.prototype.dragYAxis = function (cx) {
	log(
		"CIQ.ChartEngine.prototype.dragYAxis is no longer supported.  Use CIQ.ChartEngine.prototype.dragPlotOrAxis instead."
	);
	return;
};

CIQ.Drawing =
	CIQ.Drawing ||
	function () {
		this.chartsOnly = false;
		this.penDown = false;
	};

/**
 * Compute the proper color to use when rendering lines in the drawing.
 *
 * @memberOf CIQ.Drawing
 * @since
 * - 4.0.0
 * - 7.0.0 Deprecated
 * @deprecated Use {@link CIQ.Drawing#getLineColor} instead.
 */
CIQ.Drawing.prototype.setLineColor = function () {
	log(
		"CIQ.Drawing.prototype.setLineColor has been deprecated.  Use CIQ.Drawing.prototype.setLineColor instead."
	);
	if (CIQ.Drawing.prototype.getLineColor)
		return CIQ.Drawing.prototype.getLineColor.apply(this, arguments);
};

CIQ.Studies = CIQ.Studies || function () {};

/** @deprecated **/
CIQ.Studies.quickAddStudy = function () {
	log(
		"CIQ.Studies.quickAddStudy has been deprecated.  Use CIQ.Studies.addStudy instead."
	);
	if (CIQ.Studies.addStudy) return CIQ.Studies.addStudy.apply(null, arguments);
};

/**
 * @deprecated Since 5.2.0. Use {@link CIQ.Studies.drawZones} instead.
 */
CIQ.Studies.overZones = function () {
	log(
		"CIQ.Studies.overZones has been deprecated.  Use CIQ.Studies.drawZones instead."
	);
	if (CIQ.Studies.drawZones)
		return CIQ.Studies.drawZones.apply(null, arguments);
};

/**
 * **Deprecated. Use {@link CIQ.Studies.createVolumeChart} instead.**
 *
 * Creates a volume underlay for the chart.
 *
 * The underlay height is a % of the chart height as determined by yAxis.heightFactor.<br>
 * Each bar width will be determined by `WidthFactor` study parameter.
 * @param {CIQ.ChartEngine} stx A chart engine instance
 * @param {studyDescriptor} sd A study descriptor
 * @param {array} quotes Array of quotes
 * @memberOf CIQ.Studies
 * @deprecated use {@link CIQ.Studies.createVolumeChart}
 */
CIQ.Studies.volUnderlay = function () {
	log(
		"CIQ.Studies.volUnderlay has been deprecated.  Use CIQ.Studies.createVolumeChart instead."
	);
	if (CIQ.Studies.createVolumeChart)
		CIQ.Studies.createVolumeChart.apply(null, arguments);
};

/**
 * **Deprecated since 5.2.0. This calculation is now done in {@link CIQ.ChartEngine.AdvancedInjectable#initializeDisplay} and is no longer a separate function.**
 *
 * Method to determine the minimum and maximum points in a study panel.
 *
 * @param  {CIQ.ChartEngine} stx	The chart object
 * @param  {studyDescriptor} sd	 The study descriptor
 * @param  {array} quotes The set of quotes to evaluate
 * @memberOf CIQ.Studies
 * @deprecated Since 5.2.0. This calculation is now done in {@link CIQ.ChartEngine.AdvancedInjectable#initializeDisplay} and is no longer a separate function.
 */
CIQ.Studies.determineMinMax = function (stx, sd, quotes) {
	log(
		"CIQ.Studies.determineMinMax is no longer supported.  The calculation is done automatically elsewhere."
	);
};

/**
 * Creates the yAxis for a study panel.
 *
 * @param  {CIQ.ChartEngine} stx	The chart object
 * @param  {studyDescriptor} sd	 The study descriptor
 * @param  {array} quotes The set of quotes (representing dataSegment)
 * @param  {CIQ.ChartEngine.Panel} panel  A reference to the panel
 * @memberOf CIQ.Studies
 * @deprecated Since 5.2.0. yAxis is now created automatically via {@link CIQ.ChartEngine#renderYAxis}
 */
CIQ.Studies.createYAxis = function (stx, sd, quotes, panel) {
	log(
		"CIQ.Studies.createYAxis is no longer supported.  The action is done automatically elsewhere."
	);
};

/**
 * **Deprecated since 6.0.0. Use {@link CIQ.ChartEngine#drawHistogram} instead.**
 *
 * Convenience function for creating a volume style chart that supports multiple colors of volume bars.
 *
 * If borderMap (border colors) is passed in then the chart will display in a format where bars are flush against
 * one another so that there is no white space between bars. If however a borderMap is not specified then white space will be left
 * between the bars.
 * @param  {CIQ.ChartEngine} stx	  The chart object
 * @param  {studyDescriptor} sd	   The study descriptor
 * @param  {object} colorMap Map of colors to arrays. Each array should contain entries for each dataSegment bar mapped to that color.
 * It should contain null values for any bar that shouldn't be drawn
 * @param {object} borderMap Map of border colors for each color. If null then no borders will be drawn.
 * @example
 * var colorMap={};
 * colorMap["#FF0000"]=[56,123,null,null,45];
 * colorMap["#00FF00"]=[null,null,12,13,null];
 *
 * var borderMap={
 *	"#FF0000": "#FFFFFF",
 *	"#00FF00": "#FFFFDD"
 * };
 * CIQ.Studies.volumeChart(stx, sd, colorMap, borderMap);
 * @memberOf CIQ.Studies
 * @deprecated since 6.0.0 Use {@link CIQ.ChartEngine#drawHistogram} instead.
 */
CIQ.Studies.volumeChart = function (stx, sd, colorMap, borderMap) {
	log(
		"CIQ.Studies.volumeChart has been deprecated.  Use CIQ.ChartEngine.prototype.drawHistogram instead."
	);
	// Determine min max
	var maximum = Number.MAX_VALUE * -1;
	var color, value;
	for (color in colorMap) {
		for (var c = 0; c < colorMap[color].length; c++) {
			value = colorMap[color][c];
			if (!value) continue;
			if (value > maximum) maximum = value;
		}
	}

	// determine calculation ratios
	var panel = stx.panels[sd.panel];
	var b = Math.floor(panel.yAxis.bottom) + 0.5;
	var t = Math.floor(panel.yAxis.top) + 0.5;
	var h = b - t;
	var candleWidth = stx.layout.candleWidth;
	var borderColor = null;
	if (!sd.parameters || !sd.parameters.displayBorder) borderMap = null;
	var offset = 0;
	if (!borderMap) offset = (candleWidth - stx.chart.tmpWidth) / 2;
	var context = sd.getContext(stx);
	context.lineWidth = 1;
	stx.startClip(sd.panel);
	for (color in colorMap) {
		if (borderMap) borderColor = borderMap[color];
		context.fillStyle = color;
		if (borderColor) context.strokeStyle = borderColor;
		context.beginPath();
		var prevTop = b + 0.5;
		var farLeft = Math.floor(stx.pixelFromBar(0, panel.chart));
		var prevRight;
		for (var i = 0; i < colorMap[color].length; i++) {
			if (stx.chart.dataSegment[i] && stx.chart.dataSegment[i].candleWidth) {
				candleWidth = stx.chart.dataSegment[i].candleWidth;
				if (!borderMap) offset = candleWidth / 4;
			} else {
				candleWidth = stx.layout.candleWidth;
				if (!borderMap) offset = (candleWidth - stx.chart.tmpWidth) / 2;
			}
			if (i === 0) {
				farLeft -= candleWidth / 2;
				prevRight = farLeft;
			}
			value = colorMap[color][i];
			if (!value) {
				prevTop = b;
				prevRight += candleWidth;
				//if(borderMap) prevRight-=0.5;
				continue;
			}
			var y = value * (h / maximum);
			var top = Math.min(Math.floor(b - h + (h - y)) + 0.5, b);
			var x0, x1;
			x0 = Math.floor(prevRight + offset);
			x1 = Math.floor(prevRight + candleWidth - offset);
			x0 = Math.max(x0, farLeft);

			context.moveTo(x0, b);
			context.lineTo(x1, b);
			context.lineTo(x1, top);
			context.lineTo(x0, top);
			if (borderMap) {
				if (prevTop > top || i === 0) context.lineTo(x0, prevTop); // draw down to the top of the previous bar, so that we don't overlap strokes
			} else {
				context.lineTo(x0, b);
			}
			prevTop = top;
			prevRight += candleWidth;
			//if(borderMap) prevRight-=0.5;
		}
		context.fill();
		context.strokeStyle = borderColor;
		if (borderMap && stx.layout.candleWidth >= 2) context.stroke();
		context.closePath();
	}
	stx.endClip();
};

if (!CIQ.UI) CIQ.UI = {};
/**
 * Static method to create an observable.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the Web Components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {Object} params Parameters.
 * @param {String} [params.selector] The selector to effect the observable (adding class,
 * 		setting value).
 * @param {Object} params.obj The object to observe.
 * @param {String} [params.member] The member of the object to observe. Pass an array to
 * 		observe multiple members. Or pass nothing to observe any change to the object.
 * @param {String} [params.condition] Optional condition for the member to trigger the action.
 * @param {String} params.action The action to take: "class" - add or remove a class,
 * 		"callback" - calls back with params.
 * @param {String} params.value The value for the action (for example, class name or
 * 		callback function).
 * @return {Function} Handler for use when unobserving.
 *
 * @memberof CIQ.UI
 *
 * @example
 * <caption>Add or remove a class based on whether stx.layout.crosshair is true or false.</caption>
 * CIQ.UI.observe({selector:".toggle", obj:stx.layout, member:"crosshair", action:"class", value:"active"});
 *
 * @example
 * <caption>Add or remove a class based on whether stx.layout.chartType=="candle".</caption>
 * CIQ.UI.observe({selector:".toggle", obj:stx.layout, member:"chartType", condition:"candle", action:"class", value:"active"});
 *
 * @example
 * <caption>Get a callback from a change in value.</caption>
 * CIQ.UI.observe({selector:".toggle", obj:stx.layout, member:"chartType", condition:"candle", action:"callback", value:function(params){
 *    console.log("new value is" + params.obj[params.member]);
 * }});
 *
 * @since 7.1.0 Returns the handler.
 * @deprecated See {@link CIQ.UI.observeProperty}.
 */
CIQ.UI.observe = function (params) {
	log(
		"CIQ.UI.observe has been deprecated.  Use CIQ.UI.observeProperty instead."
	);
	if (!Object.observe) {
		log(
			"You must include thirdparty/object-observe.js in your project to use CIQ.UI.observe."
		);
		return;
	}
	var self = this;
	function observed(change) {
		var match = false;
		if (!params.member) {
			// wildcard
			match = true;
		} else if (change.name === params.member) {
			match = true;
		} else if (params.member.constructor == Array) {
			for (var i = 0; i < params.member.length; i++) {
				if (change.name === params.member[i]) match = true;
			}
		}
		if (match) {
			var nodes = $(params.selector);
			if (!nodes.length && params.action === "callback") {
				// simple callback not associated with a selector
				params.value.call(self, params);
				return;
			}
			if (params.action === "class") nodes.removeClass(params.value);
			nodes.each(function () {
				var isTrue = false;
				if (params.member) {
					if (params.condition) {
						if (params.obj[params.member] === params.condition) isTrue = true;
					} else {
						isTrue = params.obj[params.member];
					}
				}
				if (params.action === "class") {
					if (isTrue) nodes.addClass(params.value);
				}
				if (params.action === "callback") {
					params.value.call(self, params, this);
				}
				if (params.action === "value") {
					if (params.value) {
						this.value = params.value;
					} else {
						if (!params.obj[params.member]) this.value = "";
						else this.value = params.obj[params.member];
					}
				}
			});
		}
	}
	var handler = function (changes) {
		changes.forEach(observed);
	};
	Object.observe(params.obj, handler, ["update", "add", "delete"]);
	observed({ name: params.member }); // initialize
	return handler;
};

/**
 * Static method to remove an observable.
 *
 * @param {Object} params Parameters.
 * @param {Object} params.obj The object being observed.
 * @param {function} params.handler The handler to remove.
 *
 * @memberof CIQ.UI
 * @since 7.1.0
 * @deprecated See {@link CIQ.UI.unobserveProperty}.
 */
CIQ.UI.unobserve = function (params) {
	log(
		"CIQ.UI.unobserve has been deprecated.  Use CIQ.UI.unobserveProperty instead."
	);
	if (Object.unobserve) Object.unobserve(params.obj, params.handler);
};

/**
 * @name CIQ.UI.Lookup
 * @constructor
 * @deprecated Use {@link CIQ.ChartEngine.Driver.Lookup}
 * @since 6.0.0 Deprecated
 */
CIQ.UI.Lookup = function () {};

/**
 * @name CIQ.UI.Lookup.Driver
 * @constructor
 * @deprecated - use {@link CIQ.ChartEngine.Driver.Lookup}
 * @since 6.0.0 deprecated
 */
CIQ.UI.Lookup.Driver = function () {
	this.deprecated = true;
};

/**
 * @memberof CIQ.UI.Lookup.Driver
 * @deprecated Use {@link CIQ.ChartEngine.Driver.Lookup#acceptText}
 * @since 6.0.0 Deprecated
 */
CIQ.UI.Lookup.Driver.prototype.acceptText = function (
	text,
	filter,
	maxResults,
	cb
) {
	if (!this.cb) return;
};

/**
 * @name CIQ.UI.Lookup.Driver.ChartIQ
 * @constructor
 * @deprecated Use {@link CIQ.ChartEngine.Driver.Lookup.ChartIQ}
 * @since 6.0.0 Deprecated
 */
CIQ.UI.Lookup.Driver.ChartIQ = function (exchanges) {
	log(
		"CIQ.UI.Lookup.Driver.ChartIQ has been deprecated.  Use CIQ.ChartEngine.Driver.Lookup.ChartIQ instead."
	);
	this.exchanges = exchanges;
	if (!this.exchanges)
		this.exchanges = [
			"XNYS",
			"XASE",
			"XNAS",
			"XASX",
			"INDCBSX",
			"INDXASE",
			"INDXNAS",
			"IND_DJI",
			"ARCX",
			"INDARCX",
			"forex"
		];
	this.url =
		"https://symbols.chartiq.com/chiq.symbolserver.SymbolLookup.service";
	this.requestCounter = 0; //used to invalidate old requests
	//t=ibm&m=10&x=[]&e=STOCKS
};
CIQ.inheritsFrom(CIQ.UI.Lookup.Driver.ChartIQ, CIQ.UI.Lookup.Driver);
/**
 * @memberof CIQ.UI.Lookup.Driver.ChartIQ
 * @deprecated Use {@link CIQ.ChartEngine.Driver.Lookup.ChartIQ#acceptText}
 * @since 6.0.0 Deprecated
 */
CIQ.UI.Lookup.Driver.ChartIQ.prototype.acceptText = function (
	text,
	filter,
	maxResults,
	cb
) {
	if (filter == "FX") filter = "FOREX";
	if (isNaN(parseInt(maxResults, 10))) maxResults = 100;
	var url =
		this.url + "?t=" + encodeURIComponent(text) + "&m=" + maxResults + "&x=[";
	if (this.exchanges) {
		url += this.exchanges.join(",");
	}
	url += "]";
	if (filter && filter.toUpperCase() != "ALL") {
		url += "&e=" + filter;
	}

	var counter = ++this.requestCounter;
	var self = this;
	function handleResponse(status, response) {
		if (counter < self.requestCounter) return;
		if (status != 200) return;
		try {
			response = JSON.parse(response);
			var symbols = response.payload.symbols;

			var results = [];
			for (var i = 0; i < symbols.length; i++) {
				var fields = symbols[i].split("|");
				var item = {
					symbol: fields[0],
					name: fields[1],
					exchDisp: fields[2]
				};
				results.push({
					display: [item.symbol, item.name, item.exchDisp],
					data: item
				});
			}
			cb(results);
		} catch (e) {}
	}
	CIQ.postAjax({ url: url, cb: handleResponse });
};

// This namespaces is only available for "legacy" implementations which run in browser and use global namespaces
if (typeof window != "undefined") {
	Object.defineProperty(window, "STXSocial", {
		enumerable: true,
		get: function () {
			log(
				"STXSocial namespace has been deprecated.  Use CIQ.Share namespace instead."
			);
			return CIQ.Share;
		}
	});
}



/*
	Deprecated functions - advanced
*/
