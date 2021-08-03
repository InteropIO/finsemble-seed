/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/preloads/nativeOverrides.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/preloads/nativeOverrides.js":
/*!*****************************************!*\
  !*** ./src/preloads/nativeOverrides.js ***!
  \*****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/**\n * This file contains a set of overrides that will convert HTML5 window actions to corresponding Finsemble actions.\n * Overrides must be specified for each component via a \"preload\" script. You do this by adding the preload to the\n * component config like so:\n *\n * \t\"Your Component\": {\n  \t\t\t...\n\t\t\t\"component\": {\n\t\t\t\t...\n\t\t\t\t\"inject\": false,\n\t\t\t\t\"preload\": \"$applicationRoot/preloads/nativeOverrides.js\"\n\t\t\t\t...\n\t\t\t}\n\t\t\t...\n\t\t}\n\n\tIMPORTANT NOTE: If you set that path incorrectly it will cause Finsemble to stop working in that component.\n\tCheck your component's chrome console for the existence of FSBL. If it doesn't exist then check your path.\n */\n\n/**\n * This overrides the browser's built in window.open function by instead creating windows using LauncherClient.spawn.\n * This ensures that the Finsemble workspace manager is aware of newly opened windows, that they can participate in\n * the on screen workspace management, and that they can be restored with workspaces.\n */\nvar originalWindowOpen = window.open;\n\nwindow.open = function (theURL, name, specs, replace) {\n  var params = {};\n\n  if (specs) {\n    let paramList = specs.split(\",\");\n\n    for (let i = 0; i < paramList.length; i++) {\n      let param = paramList[i].split(\"=\");\n      params[param[0]] = param[1];\n    }\n  }\n\n  if (name) {\n    switch (name) {\n      case \"_self\":\n        location.href = theURL;\n        return;\n\n      case \"_top\":\n        window.top.href = theURL;\n        return;\n\n      case \"_parent\":\n        window.parent.href = theURL;\n        return;\n\n      case \"_blank\":\n        break;\n\n      default:\n        params.name = name;\n    }\n  }\n\n  let u = new URL(theURL, window.location);\n  params.url = u.href;\n  var w;\n  FSBL.Clients.LauncherClient.spawn(null, params, (err, response) => {\n    if (err) {\n      console.error(`nativeOverrides.js window.open patch error: ${err}`);\n    } else {\n      w = response.finWindow;\n    }\n  });\n  return w;\n};\n/**\n * Overrides the browser's built in alerting. Native alerts are synchronous. They cause the application to cease functioning\n * and they create an ugly pop up window. Instead, we funnel these alerts through notifications.\n */\n\n\nwindow.alert = function (message) {\n  const notification = new FSBL.Clients.NotificationClient.Notification();\n  notification.source = \"Finsemble\";\n  notification.title = \"Alert\";\n  notification.details = message;\n  notification.actions = [{\n    buttonText: \"OK\",\n    type: FSBL.Clients.NotificationClient.ActionTypes.DISMISS,\n    markAsRead: true\n  }];\n  FSBL.Clients.NotificationClient.notify(notification);\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvcHJlbG9hZHMvbmF0aXZlT3ZlcnJpZGVzLmpzP2NkMTQiXSwibmFtZXMiOlsib3JpZ2luYWxXaW5kb3dPcGVuIiwid2luZG93Iiwib3BlbiIsInRoZVVSTCIsIm5hbWUiLCJzcGVjcyIsInJlcGxhY2UiLCJwYXJhbXMiLCJwYXJhbUxpc3QiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJwYXJhbSIsImxvY2F0aW9uIiwiaHJlZiIsInRvcCIsInBhcmVudCIsInUiLCJVUkwiLCJ1cmwiLCJ3IiwiRlNCTCIsIkNsaWVudHMiLCJMYXVuY2hlckNsaWVudCIsInNwYXduIiwiZXJyIiwicmVzcG9uc2UiLCJjb25zb2xlIiwiZXJyb3IiLCJmaW5XaW5kb3ciLCJhbGVydCIsIm1lc3NhZ2UiLCJub3RpZmljYXRpb24iLCJOb3RpZmljYXRpb25DbGllbnQiLCJOb3RpZmljYXRpb24iLCJzb3VyY2UiLCJ0aXRsZSIsImRldGFpbHMiLCJhY3Rpb25zIiwiYnV0dG9uVGV4dCIsInR5cGUiLCJBY3Rpb25UeXBlcyIsIkRJU01JU1MiLCJtYXJrQXNSZWFkIiwibm90aWZ5Il0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7Ozs7QUFNQSxJQUFJQSxrQkFBa0IsR0FBR0MsTUFBTSxDQUFDQyxJQUFoQzs7QUFDQUQsTUFBTSxDQUFDQyxJQUFQLEdBQWMsVUFBVUMsTUFBVixFQUFrQkMsSUFBbEIsRUFBd0JDLEtBQXhCLEVBQStCQyxPQUEvQixFQUF3QztBQUNyRCxNQUFJQyxNQUFNLEdBQUcsRUFBYjs7QUFDQSxNQUFJRixLQUFKLEVBQVc7QUFDVixRQUFJRyxTQUFTLEdBQUdILEtBQUssQ0FBQ0ksS0FBTixDQUFZLEdBQVosQ0FBaEI7O0FBQ0EsU0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHRixTQUFTLENBQUNHLE1BQTlCLEVBQXNDRCxDQUFDLEVBQXZDLEVBQTJDO0FBQzFDLFVBQUlFLEtBQUssR0FBR0osU0FBUyxDQUFDRSxDQUFELENBQVQsQ0FBYUQsS0FBYixDQUFtQixHQUFuQixDQUFaO0FBQ0FGLFlBQU0sQ0FBQ0ssS0FBSyxDQUFDLENBQUQsQ0FBTixDQUFOLEdBQW1CQSxLQUFLLENBQUMsQ0FBRCxDQUF4QjtBQUNBO0FBQ0Q7O0FBQ0QsTUFBSVIsSUFBSixFQUFVO0FBQ1QsWUFBUUEsSUFBUjtBQUNDLFdBQUssT0FBTDtBQUNDUyxnQkFBUSxDQUFDQyxJQUFULEdBQWdCWCxNQUFoQjtBQUNBOztBQUNELFdBQUssTUFBTDtBQUNDRixjQUFNLENBQUNjLEdBQVAsQ0FBV0QsSUFBWCxHQUFrQlgsTUFBbEI7QUFDQTs7QUFDRCxXQUFLLFNBQUw7QUFDQ0YsY0FBTSxDQUFDZSxNQUFQLENBQWNGLElBQWQsR0FBcUJYLE1BQXJCO0FBQ0E7O0FBQ0QsV0FBSyxRQUFMO0FBQ0M7O0FBQ0Q7QUFDQ0ksY0FBTSxDQUFDSCxJQUFQLEdBQWNBLElBQWQ7QUFiRjtBQWVBOztBQUNELE1BQUlhLENBQUMsR0FBRyxJQUFJQyxHQUFKLENBQVFmLE1BQVIsRUFBZ0JGLE1BQU0sQ0FBQ1ksUUFBdkIsQ0FBUjtBQUNBTixRQUFNLENBQUNZLEdBQVAsR0FBYUYsQ0FBQyxDQUFDSCxJQUFmO0FBRUEsTUFBSU0sQ0FBSjtBQUNBQyxNQUFJLENBQUNDLE9BQUwsQ0FBYUMsY0FBYixDQUE0QkMsS0FBNUIsQ0FBa0MsSUFBbEMsRUFBd0NqQixNQUF4QyxFQUFnRCxDQUFDa0IsR0FBRCxFQUFNQyxRQUFOLEtBQW1CO0FBQ2xFLFFBQUlELEdBQUosRUFBUztBQUNSRSxhQUFPLENBQUNDLEtBQVIsQ0FBZSwrQ0FBOENILEdBQUksRUFBakU7QUFDQSxLQUZELE1BRU87QUFDTkwsT0FBQyxHQUFHTSxRQUFRLENBQUNHLFNBQWI7QUFDQTtBQUNELEdBTkQ7QUFPQSxTQUFPVCxDQUFQO0FBQ0EsQ0F0Q0Q7QUF3Q0E7Ozs7OztBQUlBbkIsTUFBTSxDQUFDNkIsS0FBUCxHQUFlLFVBQVVDLE9BQVYsRUFBbUI7QUFDakMsUUFBTUMsWUFBWSxHQUFHLElBQUlYLElBQUksQ0FBQ0MsT0FBTCxDQUFhVyxrQkFBYixDQUFnQ0MsWUFBcEMsRUFBckI7QUFDQUYsY0FBWSxDQUFDRyxNQUFiLEdBQXNCLFdBQXRCO0FBQ0FILGNBQVksQ0FBQ0ksS0FBYixHQUFxQixPQUFyQjtBQUNBSixjQUFZLENBQUNLLE9BQWIsR0FBdUJOLE9BQXZCO0FBQ0FDLGNBQVksQ0FBQ00sT0FBYixHQUF1QixDQUN0QjtBQUNDQyxjQUFVLEVBQUUsSUFEYjtBQUVDQyxRQUFJLEVBQUVuQixJQUFJLENBQUNDLE9BQUwsQ0FBYVcsa0JBQWIsQ0FBZ0NRLFdBQWhDLENBQTRDQyxPQUZuRDtBQUdDQyxjQUFVLEVBQUU7QUFIYixHQURzQixDQUF2QjtBQU9BdEIsTUFBSSxDQUFDQyxPQUFMLENBQWFXLGtCQUFiLENBQWdDVyxNQUFoQyxDQUF1Q1osWUFBdkM7QUFDQSxDQWJEIiwiZmlsZSI6Ii4vc3JjL3ByZWxvYWRzL25hdGl2ZU92ZXJyaWRlcy5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIGEgc2V0IG9mIG92ZXJyaWRlcyB0aGF0IHdpbGwgY29udmVydCBIVE1MNSB3aW5kb3cgYWN0aW9ucyB0byBjb3JyZXNwb25kaW5nIEZpbnNlbWJsZSBhY3Rpb25zLlxuICogT3ZlcnJpZGVzIG11c3QgYmUgc3BlY2lmaWVkIGZvciBlYWNoIGNvbXBvbmVudCB2aWEgYSBcInByZWxvYWRcIiBzY3JpcHQuIFlvdSBkbyB0aGlzIGJ5IGFkZGluZyB0aGUgcHJlbG9hZCB0byB0aGVcbiAqIGNvbXBvbmVudCBjb25maWcgbGlrZSBzbzpcbiAqXG4gKiBcdFwiWW91ciBDb21wb25lbnRcIjoge1xuICBcdFx0XHQuLi5cblx0XHRcdFwiY29tcG9uZW50XCI6IHtcblx0XHRcdFx0Li4uXG5cdFx0XHRcdFwiaW5qZWN0XCI6IGZhbHNlLFxuXHRcdFx0XHRcInByZWxvYWRcIjogXCIkYXBwbGljYXRpb25Sb290L3ByZWxvYWRzL25hdGl2ZU92ZXJyaWRlcy5qc1wiXG5cdFx0XHRcdC4uLlxuXHRcdFx0fVxuXHRcdFx0Li4uXG5cdFx0fVxuXG5cdElNUE9SVEFOVCBOT1RFOiBJZiB5b3Ugc2V0IHRoYXQgcGF0aCBpbmNvcnJlY3RseSBpdCB3aWxsIGNhdXNlIEZpbnNlbWJsZSB0byBzdG9wIHdvcmtpbmcgaW4gdGhhdCBjb21wb25lbnQuXG5cdENoZWNrIHlvdXIgY29tcG9uZW50J3MgY2hyb21lIGNvbnNvbGUgZm9yIHRoZSBleGlzdGVuY2Ugb2YgRlNCTC4gSWYgaXQgZG9lc24ndCBleGlzdCB0aGVuIGNoZWNrIHlvdXIgcGF0aC5cbiAqL1xuXG4vKipcbiAqIFRoaXMgb3ZlcnJpZGVzIHRoZSBicm93c2VyJ3MgYnVpbHQgaW4gd2luZG93Lm9wZW4gZnVuY3Rpb24gYnkgaW5zdGVhZCBjcmVhdGluZyB3aW5kb3dzIHVzaW5nIExhdW5jaGVyQ2xpZW50LnNwYXduLlxuICogVGhpcyBlbnN1cmVzIHRoYXQgdGhlIEZpbnNlbWJsZSB3b3Jrc3BhY2UgbWFuYWdlciBpcyBhd2FyZSBvZiBuZXdseSBvcGVuZWQgd2luZG93cywgdGhhdCB0aGV5IGNhbiBwYXJ0aWNpcGF0ZSBpblxuICogdGhlIG9uIHNjcmVlbiB3b3Jrc3BhY2UgbWFuYWdlbWVudCwgYW5kIHRoYXQgdGhleSBjYW4gYmUgcmVzdG9yZWQgd2l0aCB3b3Jrc3BhY2VzLlxuICovXG5cbnZhciBvcmlnaW5hbFdpbmRvd09wZW4gPSB3aW5kb3cub3BlbjtcbndpbmRvdy5vcGVuID0gZnVuY3Rpb24gKHRoZVVSTCwgbmFtZSwgc3BlY3MsIHJlcGxhY2UpIHtcblx0dmFyIHBhcmFtcyA9IHt9O1xuXHRpZiAoc3BlY3MpIHtcblx0XHRsZXQgcGFyYW1MaXN0ID0gc3BlY3Muc3BsaXQoXCIsXCIpO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcGFyYW1MaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgcGFyYW0gPSBwYXJhbUxpc3RbaV0uc3BsaXQoXCI9XCIpO1xuXHRcdFx0cGFyYW1zW3BhcmFtWzBdXSA9IHBhcmFtWzFdO1xuXHRcdH1cblx0fVxuXHRpZiAobmFtZSkge1xuXHRcdHN3aXRjaCAobmFtZSkge1xuXHRcdFx0Y2FzZSBcIl9zZWxmXCI6XG5cdFx0XHRcdGxvY2F0aW9uLmhyZWYgPSB0aGVVUkw7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgXCJfdG9wXCI6XG5cdFx0XHRcdHdpbmRvdy50b3AuaHJlZiA9IHRoZVVSTDtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0Y2FzZSBcIl9wYXJlbnRcIjpcblx0XHRcdFx0d2luZG93LnBhcmVudC5ocmVmID0gdGhlVVJMO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIFwiX2JsYW5rXCI6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cGFyYW1zLm5hbWUgPSBuYW1lO1xuXHRcdH1cblx0fVxuXHRsZXQgdSA9IG5ldyBVUkwodGhlVVJMLCB3aW5kb3cubG9jYXRpb24pO1xuXHRwYXJhbXMudXJsID0gdS5ocmVmO1xuXG5cdHZhciB3O1xuXHRGU0JMLkNsaWVudHMuTGF1bmNoZXJDbGllbnQuc3Bhd24obnVsbCwgcGFyYW1zLCAoZXJyLCByZXNwb25zZSkgPT4ge1xuXHRcdGlmIChlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoYG5hdGl2ZU92ZXJyaWRlcy5qcyB3aW5kb3cub3BlbiBwYXRjaCBlcnJvcjogJHtlcnJ9YCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHcgPSByZXNwb25zZS5maW5XaW5kb3c7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHc7XG59O1xuXG4vKipcbiAqIE92ZXJyaWRlcyB0aGUgYnJvd3NlcidzIGJ1aWx0IGluIGFsZXJ0aW5nLiBOYXRpdmUgYWxlcnRzIGFyZSBzeW5jaHJvbm91cy4gVGhleSBjYXVzZSB0aGUgYXBwbGljYXRpb24gdG8gY2Vhc2UgZnVuY3Rpb25pbmdcbiAqIGFuZCB0aGV5IGNyZWF0ZSBhbiB1Z2x5IHBvcCB1cCB3aW5kb3cuIEluc3RlYWQsIHdlIGZ1bm5lbCB0aGVzZSBhbGVydHMgdGhyb3VnaCBub3RpZmljYXRpb25zLlxuICovXG53aW5kb3cuYWxlcnQgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuXHRjb25zdCBub3RpZmljYXRpb24gPSBuZXcgRlNCTC5DbGllbnRzLk5vdGlmaWNhdGlvbkNsaWVudC5Ob3RpZmljYXRpb24oKTtcblx0bm90aWZpY2F0aW9uLnNvdXJjZSA9IFwiRmluc2VtYmxlXCI7XG5cdG5vdGlmaWNhdGlvbi50aXRsZSA9IFwiQWxlcnRcIjtcblx0bm90aWZpY2F0aW9uLmRldGFpbHMgPSBtZXNzYWdlO1xuXHRub3RpZmljYXRpb24uYWN0aW9ucyA9IFtcblx0XHR7XG5cdFx0XHRidXR0b25UZXh0OiBcIk9LXCIsXG5cdFx0XHR0eXBlOiBGU0JMLkNsaWVudHMuTm90aWZpY2F0aW9uQ2xpZW50LkFjdGlvblR5cGVzLkRJU01JU1MsXG5cdFx0XHRtYXJrQXNSZWFkOiB0cnVlLFxuXHRcdH0sXG5cdF07XG5cdEZTQkwuQ2xpZW50cy5Ob3RpZmljYXRpb25DbGllbnQubm90aWZ5KG5vdGlmaWNhdGlvbik7XG59O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/preloads/nativeOverrides.js\n");

/***/ })

/******/ });