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
eval("\n\n/**\r\n * This file contains a set of overrides that will convert HTML5 window actions to corresponding Finsemble actions.\r\n * Overrides must be specified for each component via a \"preload\" script. You do this by adding the preload to the\r\n * component config like so:\r\n *\r\n * \t\"Your Component\": {\r\n  \t\t\t...\r\n\t\t\t\"component\": {\r\n\t\t\t\t...\r\n\t\t\t\t\"inject\": false,\r\n\t\t\t\t\"preload\": \"$applicationRoot/preloads/nativeOverrides.js\"\r\n\t\t\t\t...\r\n\t\t\t}\r\n\t\t\t...\r\n\t\t}\r\n\r\n\tIMPORTANT NOTE: If you set that path incorrectly it will cause Finsemble to stop working in that component.\r\n\tCheck your component's chrome console for the existence of FSBL. If it doesn't exist then check your path.\r\n */\n\n/**\r\n * This overrides the browser's built in window.open function by instead creating windows using LauncherClient.spawn.\r\n * This ensures that the Finsemble workspace manager is aware of newly opened windows, that they can participate in\r\n * the on screen workspace management, and that they can be restored with workspaces.\r\n */\nvar originalWindowOpen = window.open;\n\nwindow.open = function (theURL, name, specs, replace) {\n  var params = {};\n\n  if (specs) {\n    let paramList = specs.split(\",\");\n\n    for (let i = 0; i < paramList.length; i++) {\n      let param = paramList[i].split(\"=\");\n      params[param[0]] = param[1];\n    }\n  }\n\n  if (name) {\n    switch (name) {\n      case \"_self\":\n        location.href = theURL;\n        return;\n\n      case \"_top\":\n        window.top.href = theURL;\n        return;\n\n      case \"_parent\":\n        window.parent.href = theURL;\n        return;\n\n      case \"_blank\":\n        break;\n\n      default:\n        params.name = name;\n    }\n  }\n\n  let u = new URL(theURL, window.location);\n  params.url = u.href;\n  var w;\n  FSBL.Clients.LauncherClient.spawn(null, params, (err, response) => {\n    if (err) {\n      console.error(`nativeOverrides.js window.open patch error: ${err}`);\n    } else {\n      w = response.finWindow;\n    }\n  });\n  return w;\n};\n/**\r\n * Overrides the browser's built in alerting. Native alerts are synchronous. They cause the application to cease functioning\r\n * and they create an ugly pop up window. Instead, we funnel these alerts through notifications.\r\n */\n\n\nwindow.alert = function (message) {\n  FSBL.UserNotification.alert(\"alert\", \"\", \"ALWAYS\", message, {});\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvcHJlbG9hZHMvbmF0aXZlT3ZlcnJpZGVzLmpzP2NkMTQiXSwibmFtZXMiOlsib3JpZ2luYWxXaW5kb3dPcGVuIiwid2luZG93Iiwib3BlbiIsInRoZVVSTCIsIm5hbWUiLCJzcGVjcyIsInJlcGxhY2UiLCJwYXJhbXMiLCJwYXJhbUxpc3QiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJwYXJhbSIsImxvY2F0aW9uIiwiaHJlZiIsInRvcCIsInBhcmVudCIsInUiLCJVUkwiLCJ1cmwiLCJ3IiwiRlNCTCIsIkNsaWVudHMiLCJMYXVuY2hlckNsaWVudCIsInNwYXduIiwiZXJyIiwicmVzcG9uc2UiLCJjb25zb2xlIiwiZXJyb3IiLCJmaW5XaW5kb3ciLCJhbGVydCIsIm1lc3NhZ2UiLCJVc2VyTm90aWZpY2F0aW9uIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFJQSxrQkFBa0IsR0FBR0MsTUFBTSxDQUFDQyxJQUFoQzs7QUFDQUQsTUFBTSxDQUFDQyxJQUFQLEdBQWMsVUFBVUMsTUFBVixFQUFrQkMsSUFBbEIsRUFBd0JDLEtBQXhCLEVBQStCQyxPQUEvQixFQUF3QztBQUNyRCxNQUFJQyxNQUFNLEdBQUcsRUFBYjs7QUFDQSxNQUFJRixLQUFKLEVBQVc7QUFDVixRQUFJRyxTQUFTLEdBQUdILEtBQUssQ0FBQ0ksS0FBTixDQUFZLEdBQVosQ0FBaEI7O0FBQ0EsU0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHRixTQUFTLENBQUNHLE1BQTlCLEVBQXNDRCxDQUFDLEVBQXZDLEVBQTJDO0FBQzFDLFVBQUlFLEtBQUssR0FBR0osU0FBUyxDQUFDRSxDQUFELENBQVQsQ0FBYUQsS0FBYixDQUFtQixHQUFuQixDQUFaO0FBQ0FGLFlBQU0sQ0FBQ0ssS0FBSyxDQUFDLENBQUQsQ0FBTixDQUFOLEdBQW1CQSxLQUFLLENBQUMsQ0FBRCxDQUF4QjtBQUNBO0FBQ0Q7O0FBQ0QsTUFBSVIsSUFBSixFQUFVO0FBQ1QsWUFBUUEsSUFBUjtBQUNDLFdBQUssT0FBTDtBQUNDUyxnQkFBUSxDQUFDQyxJQUFULEdBQWdCWCxNQUFoQjtBQUNBOztBQUNELFdBQUssTUFBTDtBQUNDRixjQUFNLENBQUNjLEdBQVAsQ0FBV0QsSUFBWCxHQUFrQlgsTUFBbEI7QUFDQTs7QUFDRCxXQUFLLFNBQUw7QUFDQ0YsY0FBTSxDQUFDZSxNQUFQLENBQWNGLElBQWQsR0FBcUJYLE1BQXJCO0FBQ0E7O0FBQ0QsV0FBSyxRQUFMO0FBQ0M7O0FBQ0Q7QUFDQ0ksY0FBTSxDQUFDSCxJQUFQLEdBQWNBLElBQWQ7QUFiRjtBQWVBOztBQUNELE1BQUlhLENBQUMsR0FBRyxJQUFJQyxHQUFKLENBQVFmLE1BQVIsRUFBZ0JGLE1BQU0sQ0FBQ1ksUUFBdkIsQ0FBUjtBQUNBTixRQUFNLENBQUNZLEdBQVAsR0FBYUYsQ0FBQyxDQUFDSCxJQUFmO0FBRUEsTUFBSU0sQ0FBSjtBQUNBQyxNQUFJLENBQUNDLE9BQUwsQ0FBYUMsY0FBYixDQUE0QkMsS0FBNUIsQ0FBa0MsSUFBbEMsRUFBd0NqQixNQUF4QyxFQUFnRCxDQUFDa0IsR0FBRCxFQUFNQyxRQUFOLEtBQW1CO0FBQ2xFLFFBQUlELEdBQUosRUFBUztBQUNSRSxhQUFPLENBQUNDLEtBQVIsQ0FBZSwrQ0FBOENILEdBQUksRUFBakU7QUFDQSxLQUZELE1BRU87QUFDTkwsT0FBQyxHQUFHTSxRQUFRLENBQUNHLFNBQWI7QUFDQTtBQUNELEdBTkQ7QUFPQSxTQUFPVCxDQUFQO0FBQ0EsQ0F0Q0Q7QUF3Q0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBbkIsTUFBTSxDQUFDNkIsS0FBUCxHQUFlLFVBQVVDLE9BQVYsRUFBbUI7QUFDakNWLE1BQUksQ0FBQ1csZ0JBQUwsQ0FBc0JGLEtBQXRCLENBQTRCLE9BQTVCLEVBQXFDLEVBQXJDLEVBQXlDLFFBQXpDLEVBQW1EQyxPQUFuRCxFQUE0RCxFQUE1RDtBQUNBLENBRkQiLCJmaWxlIjoiLi9zcmMvcHJlbG9hZHMvbmF0aXZlT3ZlcnJpZGVzLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRoaXMgZmlsZSBjb250YWlucyBhIHNldCBvZiBvdmVycmlkZXMgdGhhdCB3aWxsIGNvbnZlcnQgSFRNTDUgd2luZG93IGFjdGlvbnMgdG8gY29ycmVzcG9uZGluZyBGaW5zZW1ibGUgYWN0aW9ucy5cclxuICogT3ZlcnJpZGVzIG11c3QgYmUgc3BlY2lmaWVkIGZvciBlYWNoIGNvbXBvbmVudCB2aWEgYSBcInByZWxvYWRcIiBzY3JpcHQuIFlvdSBkbyB0aGlzIGJ5IGFkZGluZyB0aGUgcHJlbG9hZCB0byB0aGVcclxuICogY29tcG9uZW50IGNvbmZpZyBsaWtlIHNvOlxyXG4gKlxyXG4gKiBcdFwiWW91ciBDb21wb25lbnRcIjoge1xyXG4gIFx0XHRcdC4uLlxyXG5cdFx0XHRcImNvbXBvbmVudFwiOiB7XHJcblx0XHRcdFx0Li4uXHJcblx0XHRcdFx0XCJpbmplY3RcIjogZmFsc2UsXHJcblx0XHRcdFx0XCJwcmVsb2FkXCI6IFwiJGFwcGxpY2F0aW9uUm9vdC9wcmVsb2Fkcy9uYXRpdmVPdmVycmlkZXMuanNcIlxyXG5cdFx0XHRcdC4uLlxyXG5cdFx0XHR9XHJcblx0XHRcdC4uLlxyXG5cdFx0fVxyXG5cclxuXHRJTVBPUlRBTlQgTk9URTogSWYgeW91IHNldCB0aGF0IHBhdGggaW5jb3JyZWN0bHkgaXQgd2lsbCBjYXVzZSBGaW5zZW1ibGUgdG8gc3RvcCB3b3JraW5nIGluIHRoYXQgY29tcG9uZW50LlxyXG5cdENoZWNrIHlvdXIgY29tcG9uZW50J3MgY2hyb21lIGNvbnNvbGUgZm9yIHRoZSBleGlzdGVuY2Ugb2YgRlNCTC4gSWYgaXQgZG9lc24ndCBleGlzdCB0aGVuIGNoZWNrIHlvdXIgcGF0aC5cclxuICovXHJcblxyXG4vKipcclxuICogVGhpcyBvdmVycmlkZXMgdGhlIGJyb3dzZXIncyBidWlsdCBpbiB3aW5kb3cub3BlbiBmdW5jdGlvbiBieSBpbnN0ZWFkIGNyZWF0aW5nIHdpbmRvd3MgdXNpbmcgTGF1bmNoZXJDbGllbnQuc3Bhd24uXHJcbiAqIFRoaXMgZW5zdXJlcyB0aGF0IHRoZSBGaW5zZW1ibGUgd29ya3NwYWNlIG1hbmFnZXIgaXMgYXdhcmUgb2YgbmV3bHkgb3BlbmVkIHdpbmRvd3MsIHRoYXQgdGhleSBjYW4gcGFydGljaXBhdGUgaW5cclxuICogdGhlIG9uIHNjcmVlbiB3b3Jrc3BhY2UgbWFuYWdlbWVudCwgYW5kIHRoYXQgdGhleSBjYW4gYmUgcmVzdG9yZWQgd2l0aCB3b3Jrc3BhY2VzLlxyXG4gKi9cclxuXHJcbnZhciBvcmlnaW5hbFdpbmRvd09wZW4gPSB3aW5kb3cub3Blbjtcclxud2luZG93Lm9wZW4gPSBmdW5jdGlvbiAodGhlVVJMLCBuYW1lLCBzcGVjcywgcmVwbGFjZSkge1xyXG5cdHZhciBwYXJhbXMgPSB7fTtcclxuXHRpZiAoc3BlY3MpIHtcclxuXHRcdGxldCBwYXJhbUxpc3QgPSBzcGVjcy5zcGxpdChcIixcIik7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHBhcmFtTGlzdC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRsZXQgcGFyYW0gPSBwYXJhbUxpc3RbaV0uc3BsaXQoXCI9XCIpO1xyXG5cdFx0XHRwYXJhbXNbcGFyYW1bMF1dID0gcGFyYW1bMV07XHJcblx0XHR9XHJcblx0fVxyXG5cdGlmIChuYW1lKSB7XHJcblx0XHRzd2l0Y2ggKG5hbWUpIHtcclxuXHRcdFx0Y2FzZSBcIl9zZWxmXCI6XHJcblx0XHRcdFx0bG9jYXRpb24uaHJlZiA9IHRoZVVSTDtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdGNhc2UgXCJfdG9wXCI6XHJcblx0XHRcdFx0d2luZG93LnRvcC5ocmVmID0gdGhlVVJMO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0Y2FzZSBcIl9wYXJlbnRcIjpcclxuXHRcdFx0XHR3aW5kb3cucGFyZW50LmhyZWYgPSB0aGVVUkw7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRjYXNlIFwiX2JsYW5rXCI6XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cGFyYW1zLm5hbWUgPSBuYW1lO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRsZXQgdSA9IG5ldyBVUkwodGhlVVJMLCB3aW5kb3cubG9jYXRpb24pO1xyXG5cdHBhcmFtcy51cmwgPSB1LmhyZWY7XHJcblxyXG5cdHZhciB3O1xyXG5cdEZTQkwuQ2xpZW50cy5MYXVuY2hlckNsaWVudC5zcGF3bihudWxsLCBwYXJhbXMsIChlcnIsIHJlc3BvbnNlKSA9PiB7XHJcblx0XHRpZiAoZXJyKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoYG5hdGl2ZU92ZXJyaWRlcy5qcyB3aW5kb3cub3BlbiBwYXRjaCBlcnJvcjogJHtlcnJ9YCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR3ID0gcmVzcG9uc2UuZmluV2luZG93O1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdHJldHVybiB3O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE92ZXJyaWRlcyB0aGUgYnJvd3NlcidzIGJ1aWx0IGluIGFsZXJ0aW5nLiBOYXRpdmUgYWxlcnRzIGFyZSBzeW5jaHJvbm91cy4gVGhleSBjYXVzZSB0aGUgYXBwbGljYXRpb24gdG8gY2Vhc2UgZnVuY3Rpb25pbmdcclxuICogYW5kIHRoZXkgY3JlYXRlIGFuIHVnbHkgcG9wIHVwIHdpbmRvdy4gSW5zdGVhZCwgd2UgZnVubmVsIHRoZXNlIGFsZXJ0cyB0aHJvdWdoIG5vdGlmaWNhdGlvbnMuXHJcbiAqL1xyXG53aW5kb3cuYWxlcnQgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG5cdEZTQkwuVXNlck5vdGlmaWNhdGlvbi5hbGVydChcImFsZXJ0XCIsIFwiXCIsIFwiQUxXQVlTXCIsIG1lc3NhZ2UsIHt9KTtcclxufTtcclxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/preloads/nativeOverrides.js\n");

/***/ })

/******/ });