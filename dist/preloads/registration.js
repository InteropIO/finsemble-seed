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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/preloads/registration.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/preloads/registration.js":
/*!**************************************!*\
  !*** ./src/preloads/registration.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// Checks whether the registration has completed and publishes authorization\nconst registrationHandler = () => {\n  // When the thank you message is displayed, the registration has been completed.\n  const registrationComplete = !!document.getElementsByClassName(\"hs-form__thankyou-message\").length;\n\n  if (registrationComplete) {\n    // save username to prevent having to register again.\n    localStorage.setItem(\"username\", \"default\");\n  }\n\n  let username = localStorage.getItem(\"username\");\n  fin.desktop.System.getEnvironmentVariable(\"EVAL_FORM\", env => {\n    if (username || env !== \"yes\") {\n      // If user has already registered, or not in evaluation mode (yarn start), don't show registration form\n      username = username ? username : \"default\"; // User has already registered\n\n      FSBL.Clients.AuthenticationClient.publishAuthorization(username, {\n        username\n      }); // Close registration window\n\n      finsembleWindow.close();\n    } else {\n      // Hiding splash screen because it can sometimes obscure the registration form.\n      FSBL.System.hideSplashScreen(); // Show registration form for user to register.\n\n      finsembleWindow.show();\n    }\n  });\n}; // Wait briefly for page to render before looking for the submit button\n\n\nsetTimeout(() => {\n  const buttons = document.getElementsByTagName(\"button\");\n\n  if (buttons.length == 1) {\n    buttons[0].onclick = () => {\n      // Wait briefly for page to render before checking the registration\n      setTimeout(registrationHandler, 2000);\n    };\n  }\n\n  const buttonRowDiv = document.getElementsByClassName(\"hs-form__actions\")[0];\n  const nbsp = document.createTextNode(\"\\u00A0\");\n  buttonRowDiv.appendChild(nbsp);\n  const closeButton = document.createElement(\"button\");\n  closeButton.setAttribute(\"class\", \"hs-form__actions__submit\");\n  closeButton.appendChild(document.createTextNode(\"Close\"));\n\n  closeButton.onclick = () => FSBL.System.exit();\n\n  buttonRowDiv.appendChild(closeButton);\n}, 2000); // Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the\n// FSBL event\n\nif (window.FSBL && FSBL.addEventListener) {\n  FSBL.addEventListener(\"onReady\", registrationHandler);\n} else {\n  window.addEventListener(\"FSBLReady\", registrationHandler);\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvcHJlbG9hZHMvcmVnaXN0cmF0aW9uLmpzPzhjNzMiXSwibmFtZXMiOlsicmVnaXN0cmF0aW9uSGFuZGxlciIsInJlZ2lzdHJhdGlvbkNvbXBsZXRlIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwibGVuZ3RoIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsInVzZXJuYW1lIiwiZ2V0SXRlbSIsImZpbiIsImRlc2t0b3AiLCJTeXN0ZW0iLCJnZXRFbnZpcm9ubWVudFZhcmlhYmxlIiwiZW52IiwiRlNCTCIsIkNsaWVudHMiLCJBdXRoZW50aWNhdGlvbkNsaWVudCIsInB1Ymxpc2hBdXRob3JpemF0aW9uIiwiZmluc2VtYmxlV2luZG93IiwiY2xvc2UiLCJoaWRlU3BsYXNoU2NyZWVuIiwic2hvdyIsInNldFRpbWVvdXQiLCJidXR0b25zIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJvbmNsaWNrIiwiYnV0dG9uUm93RGl2IiwibmJzcCIsImNyZWF0ZVRleHROb2RlIiwiYXBwZW5kQ2hpbGQiLCJjbG9zZUJ1dHRvbiIsImNyZWF0ZUVsZW1lbnQiLCJzZXRBdHRyaWJ1dGUiLCJleGl0Iiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLE1BQU1BLG1CQUFtQixHQUFHLE1BQU07QUFDakM7QUFDQSxRQUFNQyxvQkFBb0IsR0FBRyxDQUFDLENBQUNDLFFBQVEsQ0FBQ0Msc0JBQVQsQ0FBZ0MsMkJBQWhDLEVBQTZEQyxNQUE1Rjs7QUFDQSxNQUFJSCxvQkFBSixFQUEwQjtBQUN6QjtBQUNBSSxnQkFBWSxDQUFDQyxPQUFiLENBQXFCLFVBQXJCLEVBQWlDLFNBQWpDO0FBQ0E7O0FBRUQsTUFBSUMsUUFBUSxHQUFHRixZQUFZLENBQUNHLE9BQWIsQ0FBcUIsVUFBckIsQ0FBZjtBQUNBQyxLQUFHLENBQUNDLE9BQUosQ0FBWUMsTUFBWixDQUFtQkMsc0JBQW5CLENBQTBDLFdBQTFDLEVBQXdEQyxHQUFELElBQVM7QUFDL0QsUUFBSU4sUUFBUSxJQUFJTSxHQUFHLEtBQUssS0FBeEIsRUFBK0I7QUFDOUI7QUFDQU4sY0FBUSxHQUFHQSxRQUFRLEdBQUdBLFFBQUgsR0FBYyxTQUFqQyxDQUY4QixDQUk5Qjs7QUFDQU8sVUFBSSxDQUFDQyxPQUFMLENBQWFDLG9CQUFiLENBQWtDQyxvQkFBbEMsQ0FBdURWLFFBQXZELEVBQWlFO0FBQUVBO0FBQUYsT0FBakUsRUFMOEIsQ0FPOUI7O0FBQ0FXLHFCQUFlLENBQUNDLEtBQWhCO0FBQ0EsS0FURCxNQVNPO0FBQ047QUFDQUwsVUFBSSxDQUFDSCxNQUFMLENBQVlTLGdCQUFaLEdBRk0sQ0FJTjs7QUFDQUYscUJBQWUsQ0FBQ0csSUFBaEI7QUFDQTtBQUNELEdBakJEO0FBa0JBLENBM0JELEMsQ0E2QkE7OztBQUNBQyxVQUFVLENBQUMsTUFBTTtBQUNoQixRQUFNQyxPQUFPLEdBQUdyQixRQUFRLENBQUNzQixvQkFBVCxDQUE4QixRQUE5QixDQUFoQjs7QUFDQSxNQUFJRCxPQUFPLENBQUNuQixNQUFSLElBQWtCLENBQXRCLEVBQXlCO0FBQ3hCbUIsV0FBTyxDQUFDLENBQUQsQ0FBUCxDQUFXRSxPQUFYLEdBQXFCLE1BQU07QUFDMUI7QUFDQUgsZ0JBQVUsQ0FBQ3RCLG1CQUFELEVBQXNCLElBQXRCLENBQVY7QUFDQSxLQUhEO0FBSUE7O0FBRUQsUUFBTTBCLFlBQVksR0FBR3hCLFFBQVEsQ0FBQ0Msc0JBQVQsQ0FBZ0Msa0JBQWhDLEVBQW9ELENBQXBELENBQXJCO0FBRUEsUUFBTXdCLElBQUksR0FBR3pCLFFBQVEsQ0FBQzBCLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBYjtBQUNBRixjQUFZLENBQUNHLFdBQWIsQ0FBeUJGLElBQXpCO0FBRUEsUUFBTUcsV0FBVyxHQUFHNUIsUUFBUSxDQUFDNkIsYUFBVCxDQUF1QixRQUF2QixDQUFwQjtBQUNBRCxhQUFXLENBQUNFLFlBQVosQ0FBeUIsT0FBekIsRUFBa0MsMEJBQWxDO0FBQ0FGLGFBQVcsQ0FBQ0QsV0FBWixDQUF3QjNCLFFBQVEsQ0FBQzBCLGNBQVQsQ0FBd0IsT0FBeEIsQ0FBeEI7O0FBQ0FFLGFBQVcsQ0FBQ0wsT0FBWixHQUFzQixNQUFNWCxJQUFJLENBQUNILE1BQUwsQ0FBWXNCLElBQVosRUFBNUI7O0FBQ0FQLGNBQVksQ0FBQ0csV0FBYixDQUF5QkMsV0FBekI7QUFDQSxDQW5CUyxFQW1CUCxJQW5CTyxDQUFWLEMsQ0FxQkE7QUFDQTs7QUFDQSxJQUFJSSxNQUFNLENBQUNwQixJQUFQLElBQWVBLElBQUksQ0FBQ3FCLGdCQUF4QixFQUEwQztBQUN6Q3JCLE1BQUksQ0FBQ3FCLGdCQUFMLENBQXNCLFNBQXRCLEVBQWlDbkMsbUJBQWpDO0FBQ0EsQ0FGRCxNQUVPO0FBQ05rQyxRQUFNLENBQUNDLGdCQUFQLENBQXdCLFdBQXhCLEVBQXFDbkMsbUJBQXJDO0FBQ0EiLCJmaWxlIjoiLi9zcmMvcHJlbG9hZHMvcmVnaXN0cmF0aW9uLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ2hlY2tzIHdoZXRoZXIgdGhlIHJlZ2lzdHJhdGlvbiBoYXMgY29tcGxldGVkIGFuZCBwdWJsaXNoZXMgYXV0aG9yaXphdGlvblxyXG5jb25zdCByZWdpc3RyYXRpb25IYW5kbGVyID0gKCkgPT4ge1xyXG5cdC8vIFdoZW4gdGhlIHRoYW5rIHlvdSBtZXNzYWdlIGlzIGRpc3BsYXllZCwgdGhlIHJlZ2lzdHJhdGlvbiBoYXMgYmVlbiBjb21wbGV0ZWQuXHJcblx0Y29uc3QgcmVnaXN0cmF0aW9uQ29tcGxldGUgPSAhIWRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJocy1mb3JtX190aGFua3lvdS1tZXNzYWdlXCIpLmxlbmd0aDtcclxuXHRpZiAocmVnaXN0cmF0aW9uQ29tcGxldGUpIHtcclxuXHRcdC8vIHNhdmUgdXNlcm5hbWUgdG8gcHJldmVudCBoYXZpbmcgdG8gcmVnaXN0ZXIgYWdhaW4uXHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJuYW1lXCIsIFwiZGVmYXVsdFwiKTtcclxuXHR9XHJcblxyXG5cdGxldCB1c2VybmFtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIik7XHJcblx0ZmluLmRlc2t0b3AuU3lzdGVtLmdldEVudmlyb25tZW50VmFyaWFibGUoXCJFVkFMX0ZPUk1cIiwgKGVudikgPT4ge1xyXG5cdFx0aWYgKHVzZXJuYW1lIHx8IGVudiAhPT0gXCJ5ZXNcIikge1xyXG5cdFx0XHQvLyBJZiB1c2VyIGhhcyBhbHJlYWR5IHJlZ2lzdGVyZWQsIG9yIG5vdCBpbiBldmFsdWF0aW9uIG1vZGUgKHlhcm4gc3RhcnQpLCBkb24ndCBzaG93IHJlZ2lzdHJhdGlvbiBmb3JtXHJcblx0XHRcdHVzZXJuYW1lID0gdXNlcm5hbWUgPyB1c2VybmFtZSA6IFwiZGVmYXVsdFwiO1xyXG5cclxuXHRcdFx0Ly8gVXNlciBoYXMgYWxyZWFkeSByZWdpc3RlcmVkXHJcblx0XHRcdEZTQkwuQ2xpZW50cy5BdXRoZW50aWNhdGlvbkNsaWVudC5wdWJsaXNoQXV0aG9yaXphdGlvbih1c2VybmFtZSwgeyB1c2VybmFtZSB9KTtcclxuXHJcblx0XHRcdC8vIENsb3NlIHJlZ2lzdHJhdGlvbiB3aW5kb3dcclxuXHRcdFx0Zmluc2VtYmxlV2luZG93LmNsb3NlKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBIaWRpbmcgc3BsYXNoIHNjcmVlbiBiZWNhdXNlIGl0IGNhbiBzb21ldGltZXMgb2JzY3VyZSB0aGUgcmVnaXN0cmF0aW9uIGZvcm0uXHJcblx0XHRcdEZTQkwuU3lzdGVtLmhpZGVTcGxhc2hTY3JlZW4oKTtcclxuXHJcblx0XHRcdC8vIFNob3cgcmVnaXN0cmF0aW9uIGZvcm0gZm9yIHVzZXIgdG8gcmVnaXN0ZXIuXHJcblx0XHRcdGZpbnNlbWJsZVdpbmRvdy5zaG93KCk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn07XHJcblxyXG4vLyBXYWl0IGJyaWVmbHkgZm9yIHBhZ2UgdG8gcmVuZGVyIGJlZm9yZSBsb29raW5nIGZvciB0aGUgc3VibWl0IGJ1dHRvblxyXG5zZXRUaW1lb3V0KCgpID0+IHtcclxuXHRjb25zdCBidXR0b25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJidXR0b25cIik7XHJcblx0aWYgKGJ1dHRvbnMubGVuZ3RoID09IDEpIHtcclxuXHRcdGJ1dHRvbnNbMF0ub25jbGljayA9ICgpID0+IHtcclxuXHRcdFx0Ly8gV2FpdCBicmllZmx5IGZvciBwYWdlIHRvIHJlbmRlciBiZWZvcmUgY2hlY2tpbmcgdGhlIHJlZ2lzdHJhdGlvblxyXG5cdFx0XHRzZXRUaW1lb3V0KHJlZ2lzdHJhdGlvbkhhbmRsZXIsIDIwMDApO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IGJ1dHRvblJvd0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJocy1mb3JtX19hY3Rpb25zXCIpWzBdO1xyXG5cclxuXHRjb25zdCBuYnNwID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcXHUwMEEwXCIpO1xyXG5cdGJ1dHRvblJvd0Rpdi5hcHBlbmRDaGlsZChuYnNwKTtcclxuXHRcclxuXHRjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XHJcblx0Y2xvc2VCdXR0b24uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJocy1mb3JtX19hY3Rpb25zX19zdWJtaXRcIik7XHJcblx0Y2xvc2VCdXR0b24uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJDbG9zZVwiKSk7XHJcblx0Y2xvc2VCdXR0b24ub25jbGljayA9ICgpID0+IEZTQkwuU3lzdGVtLmV4aXQoKTtcclxuXHRidXR0b25Sb3dEaXYuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xyXG59LCAyMDAwKTtcclxuXHJcbi8vIFN0YXJ0dXAgcGF0dGVybiBmb3IgcHJlbG9hZC4gUHJlbG9hZHMgY2FuIGNvbWUgaW4gYW55IG9yZGVyLCBzbyB3ZSBuZWVkIHRvIHdhaXQgb24gZWl0aGVyIHRoZSB3aW5kb3cgZXZlbnQgb3IgdGhlXHJcbi8vIEZTQkwgZXZlbnRcclxuaWYgKHdpbmRvdy5GU0JMICYmIEZTQkwuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG5cdEZTQkwuYWRkRXZlbnRMaXN0ZW5lcihcIm9uUmVhZHlcIiwgcmVnaXN0cmF0aW9uSGFuZGxlcik7XHJcbn0gZWxzZSB7XHJcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJGU0JMUmVhZHlcIiwgcmVnaXN0cmF0aW9uSGFuZGxlcik7XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/preloads/registration.js\n");

/***/ })

/******/ });