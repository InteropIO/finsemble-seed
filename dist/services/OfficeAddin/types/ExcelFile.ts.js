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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/services/OfficeAddin/types/ExcelFile.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/services/OfficeAddin/types/ExcelFile.ts":
/*!*****************************************************!*\
  !*** ./src/services/OfficeAddin/types/ExcelFile.ts ***!
  \*****************************************************/
/*! exports provided: default */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ExcelFile; });\nclass ExcelFile {\r\n    constructor(fileName, filePath, createTimestamp, aliveTimestamp) {\r\n        this.fileName = fileName;\r\n        this.filePath = filePath;\r\n        this.createTimestamp = createTimestamp;\r\n        this.aliveTimestamp = aliveTimestamp;\r\n    }\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2VydmljZXMvT2ZmaWNlQWRkaW4vdHlwZXMvRXhjZWxGaWxlLnRzPzc5MzIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQTtBQUFlLE1BQU0sU0FBUztJQU0xQixZQUFZLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxlQUF1QixFQUFFLGNBQXNCO1FBQzNGLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBQ3pDLENBQUM7Q0FDSiIsImZpbGUiOiIuL3NyYy9zZXJ2aWNlcy9PZmZpY2VBZGRpbi90eXBlcy9FeGNlbEZpbGUudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSUZpbGUgZnJvbSAnLi9JRmlsZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4Y2VsRmlsZSBpbXBsZW1lbnRzIElGaWxlIHtcclxuICAgIGZpbGVOYW1lOiBTdHJpbmc7XHJcbiAgICBmaWxlUGF0aDogU3RyaW5nO1xyXG4gICAgY3JlYXRlVGltZXN0YW1wOiBudW1iZXI7XHJcbiAgICBhbGl2ZVRpbWVzdGFtcDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGZpbGVOYW1lOiBTdHJpbmcsIGZpbGVQYXRoOiBTdHJpbmcsIGNyZWF0ZVRpbWVzdGFtcDogbnVtYmVyLCBhbGl2ZVRpbWVzdGFtcDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5maWxlTmFtZSA9IGZpbGVOYW1lO1xyXG4gICAgICAgIHRoaXMuZmlsZVBhdGggPSBmaWxlUGF0aDtcclxuICAgICAgICB0aGlzLmNyZWF0ZVRpbWVzdGFtcCA9IGNyZWF0ZVRpbWVzdGFtcDtcclxuICAgICAgICB0aGlzLmFsaXZlVGltZXN0YW1wID0gYWxpdmVUaW1lc3RhbXA7XHJcbiAgICB9XHJcbn0iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/services/OfficeAddin/types/ExcelFile.ts\n");

/***/ })

/******/ });