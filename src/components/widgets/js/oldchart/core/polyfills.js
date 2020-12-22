//-------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------

(function (definition) {
	"use strict";
	
	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition();
	} else if (typeof define === "function" && define.amd) {
		define(definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for polyfills.js.");
	}
})(function(){
	var _exports={};
	
	// Update console polyfill. Fix #731 #732 - https://github.com/zhukov/webogram/pull/732
	// Console-polyfill. MIT license.
	// https://github.com/paulmillr/console-polyfill
	// Make it safe to do console.log() always.
	(function(global) {
	  'use strict';
	  if(global.console) return;
	  global.console={};
	  var con = global.console;
	  var prop, method;
	  var empty = {};
	  var dummy = function() {};
	  var properties = 'memory'.split(',');
	  var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
		 'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
		 'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
	  while (prop = properties.pop()) if (!con[prop]) con[prop] = empty;
	  while (method = methods.pop()) if (!con[method]) con[method] = dummy;
	})(typeof window === 'undefined' ? this : window);
	// Using `this` for web workers while maintaining compatibility with browser
	// targeted script loaders such as Browserify or Webpack where the only way to
	// get to the global object is via `window`.

	console.log("polyfills.js",_exports);

	//http://jsfiddle.net/JRKwH/1/
	function saveSelection() {
	  if (window.getSelection) {
		  var sel = window.getSelection();
		  if (sel.getRangeAt && sel.rangeCount) {
			  var ranges = [];
			  for (var i = 0, len = sel.rangeCount; i < len; ++i) {
				  ranges.push(sel.getRangeAt(i));
			  }
			  return ranges;
		  }
	  } else if (document.selection && document.selection.createRange) {
		  return document.selection.createRange();
	  }
	  return null;
	}
	function restoreSelection(savedSel) {
	  if (savedSel) {
		  if (window.getSelection) {
			  var sel = window.getSelection();
			  sel.removeAllRanges();
			  for (var i = 0, len = savedSel.length; i < len; ++i) {
				  sel.addRange(savedSel[i]);
			  }
		  } else if (document.selection && savedSel.select) {
			  savedSel.select();
		  }
	  }
	}
	_exports.saveSelection=saveSelection;
	_exports.restoreSelection=restoreSelection;

	/* Easing cubics from
	http://gizma.com/easing/#expo1
	t = current time (t should move from zero to d)
	b = starting value
	c = change in value (b + c = ending value )
	d = duration
	*/

	Math.easeInOutQuad = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	};

	Math.easeInOutCubic = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	};

	// From MDN:
	// Reference: http://es5.github.io/#x15.4.4.14
	if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function(searchElement, fromIndex) {
	        var k;
	        if (this == null) {
	            throw new TypeError('"this" is null or not defined');
	        }
	        var o = Object(this);
	        var len = o.length >>> 0;
	        if (len === 0) {
	            return -1;
	        }
	        var n = +fromIndex || 0;
	        if (Math.abs(n) === Infinity) {
	            n = 0;
	        }
	        if (n >= len) {
	            return -1;
	        }
	        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
	        while (k < len) {
	            if (k in o && o[k] === searchElement) {
	                return k;
	            }
	            k++;
	        }
	        return -1;
	    };
	}

	return _exports;
});