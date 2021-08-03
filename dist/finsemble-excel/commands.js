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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/finsemble-excel/commands/commands.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@chartiq/fpe-router/dist/fpe-router.js":
/*!*************************************************************!*\
  !*** ./node_modules/@chartiq/fpe-router/dist/fpe-router.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Promise) {(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else {}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./clientBridge/launcherClient.js":
/*!****************************************!*\
  !*** ./clientBridge/launcherClient.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

/**
 * @introduction
 *
 * <h2>Launcher Client</h2>
 *
 * The Launcher client handles spawning windows
 * @constructor
 * @publishedName Launcher Client
 *
 * */
var LauncherClient =
/*#__PURE__*/
function () {
  function LauncherClient(routerClient) {
    _classCallCheck(this, LauncherClient);

    if (routerClient["default"]) {
      this.spawnClient = routerClient["default"];
    } else {
      this.spawnClient = routerClient;
    }
  }
  /**
       * Spawn
       *
       * @param {string} component componentType of the component to spwan
       * @param {string} parameters Finsemble component configuration parameters
       * @param {function} callback standard callback
       *
       */


  _createClass(LauncherClient, [{
    key: "Spawn",
    value: function Spawn(component, parameters, callback) {
      if (parameters === void 0) {
        parameters = {};
      }

      parameters["component"] = component;
      this.spawnClient.query("Launcher.spawn", parameters, {}, callback);
    }
  }]);

  return LauncherClient;
}();

/* harmony default export */ __webpack_exports__["default"] = (LauncherClient);

/***/ }),

/***/ "./clientBridge/linkerClient.js":
/*!**************************************!*\
  !*** ./clientBridge/linkerClient.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
// import e from "express";

/**
 * ## Linker Client
 *
 *  The Linker API allows components to synchronize on a piece of data. 
 *  For instance, an end user can use the Linker to link multiple components by stock symbol.
 *  Use the Linker API to enable your components to participate in this synchronization.
 *  In order for components to be linked, the components must understand the data format that will be passed between them (the "context"), and agree on a label that identifies that format (the dataType).
 * 
 *  For instance, components might choose to publish and subscribe to a dataType called "symbol".
 *  They would then also need to agree what a "symbol" looks like, for instance, `{symbol:"IBM"}`. 
 *  The Linker API doesn't proscribe any specific format for context or set of labels.
 *
 * @class
 */
var LinkerClient =
/*#__PURE__*/
function () {
  /**
   * Creates an instance of LinkerClient.
   * @param {RouterClient} routerClient An instance of the Router Client
   * @memberof LinkerClient
   */
  function LinkerClient(routerClient) {
    var _this = this;

    _classCallCheck(this, LinkerClient);

    function _uuid() {
      var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      var chars = CHARS,
          uuid = new Array(36),
          rnd = 0,
          r;

      for (var i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
          uuid[i] = '-';
        } else if (i == 14) {
          uuid[i] = '4';
        } else {
          if (rnd <= 0x02) rnd = 0x2000000 + Math.random() * 0x1000000 | 0;
          r = rnd & 0xf;
          rnd = rnd >> 4;
          uuid[i] = chars[i == 19 ? r & 0x3 | 0x8 : r];
        }
      }

      return uuid.join('');
    }

    var uuid = _uuid();

    this.routerClient = routerClient;
    this.windowIdentifier = {
      windowName: 'Linker Client ' + uuid,
      uuid: uuid,
      componentType: 'LinkerClient'
    };
    this.key = (this.windowIdentifier.windowName + "::" + this.windowIdentifier.uuid).replace(".", "_");
    this.channelListenerList = [];
    this.channels = [];
    this.allChannels = [];
    this.linkerSubscribers = {};
    this.clients = {};
    this.storeName = 'Finsemble_Linker';
    var data = {
      store: this.storeName,
      field: "channels"
    };
    routerClient.query("storeService.getValue", data, {}, function (response) {
      if (response) {
        _this.allChannels = response["data"];
      }
    });
    this.updateListeners();
  }
  /**
   * @private
   *
   * @param {String} channel 
   * @param {Object} parameters See [Publish parameters for more detail]{@link LinkerClient#Publish}
   * @memberof LinkerClient
   */


  _createClass(LinkerClient, [{
    key: "PublishToChannel",
    value: function PublishToChannel(channel, parameters) {
      this.routerClient.transmit(channel, {
        "type": parameters["dataType"],
        "data": parameters["data"]
      });
    }
    /**
    * Publish a piece of data. 
    * Foreign components that are linked to the channels published on will receive the data if they have subscribed to this dataType.
    * They can then use that data to synchronize their internal state.
    * See [Subscribe]{@link LinkerClient#Subscribe} for the corresponding method.
    * 
    *
    * @param {Object} parameters Parameters is an object that represents the message being sent. 
    * @param {string | string[]} parameters.channels An string or string array representing a list of channels to publish on.
    * @param {Object} parameters.data An object representing the data to send.
    * @param {String} parameters.dataType A string representing the topic to publish on.
    *
    * @example
    * let parameters = {
    *   channels: ["group1"]
    *   dataType: "symbol",
    *   data: "AAPL"
    * };
    * LinkerClient.Publish(parameters);
    *
    */

  }, {
    key: "Publish",
    value: function Publish(parameters) {
      var _this2 = this;

      var publishChannels = [];

      if (parameters["channels"] != null) {
        publishChannels = parameters["channels"];
      }

      if (publishChannels != null) {
        publishChannels.forEach(function (element) {
          _this2.PublishToChannel(element, parameters);
        });
      }
    }
    /**
     * Register a client for a specific data type that is sent to a channel. Calling `subscribe` multiple times add additional handlers.
     *
     * @param {String} dataType A string representing the data type to subscribe to.
     * @param {Function} callback A function to be called once the Linker receives the specific data.
     * @memberof LinkerClient
     * 
     * @example
     * 
     * LinkerClient.Subscribe("symbol", function(data) {
     *  //console.log("New symbol received from a remote component: ", data);
     * });
     * 
     */

  }, {
    key: "Subscribe",
    value: function Subscribe(dataType, callback) {
      if (dataType in this.linkerSubscribers) {
        this.linkerSubscribers[dataType] += callback;
      } else {
        this.linkerSubscribers[dataType] = callback;
      }

      this.updateListeners();
    }
    /**
     * @private
     *
     * @param {Error} err If not null, an error explaining what went wrong
     * @param {*} data 
     * @memberof LinkerClient
     */

  }, {
    key: "handleListeners",
    value: function handleListeners(err, data) {
      if (err) {
        console.error(err);
      }

      //console.log('handleListeners fired');
      var listeners = this.linkerSubscribers[data.data.type];

      if (listeners && listeners.length > 0) {
        for (var i = 0; i < listeners.length; i++) {
          listeners[i](data.data.data, {
            data: data.data.data,
            header: data.header,
            originatedHere: data.originatedHere
          });
        }
      }
    }
    /**
     * @private
     *
     * @memberof LinkerClient
     */

  }, {
    key: "updateListeners",
    value: function updateListeners() {
      var _this3 = this;

      //console.log('updateListeners fired');

      var _loop = function _loop(i) {
        var channel = _this3.channelListenerList[i];
        var channels = Object.keys(_this3.channels);

        if (!channels.filter(function (g) {
          return g == channel;
        }).length) {
          _this3.routerClient.removeListener(channel, _this3.handleListeners);

          _this3.channelListenerList.splice(i, 1);
        }
      };

      for (var i = this.channelListenerList.length - 1; i >= 0; i--) {
        _loop(i);
      }

      var channels = Object.keys(this.channels);

      for (var _i = 0; _i < channels.length; _i++) {
        var channel = channels[_i];

        if (!this.channelListenerList.includes(channel)) {
          this.routerClient.addListener(channel, this.handleListeners);
          this.channelListenerList.push(channel);
        }
      }
    }
    /**
     * Add a component to a Linker channel programmatically. 
     * Components will begin receiving any new contexts published to this channel but will **not** receive the currently established context.
     *
     * @param {(String | String[])} channel The name of the channel, or channels, to link our component to.
     * @param {WindowIdentifier} [windowIdentifier] windowIdentifier for the component. If null, it defaults to the current window.
     * @param {Function} [callback] Callback to retrieve returned results asynchronously.
     * @memberof LinkerClient
     * 
     * @example
     * 
     * LinkerClient.LinkToChannel("group3", null); // Linker current window to channel
     * LinkerClient.LinkToChannel("group3", windowIdentifier); // Link the requested window to channel
     */

  }, {
    key: "LinkToChannel",
    value: function LinkToChannel(channel, windowIdentifier, callback) {
      function makeKey(windowIdentifier) {
        return (windowIdentifier["windowName"] + "::" + windowIdentifier["uuid"]).replace(".", "_");
      }

      var _windowIdentifier;

      var keyToUse = this.key;

      if (!windowIdentifier) {
        _windowIdentifier = this.windowIdentifier;
      } else {
        _windowIdentifier = windowIdentifier;
        keyToUse = makeKey(windowIdentifier);
      }

      if (!this.clients[keyToUse]) {
        this.clients[keyToUse] = {
          client: _windowIdentifier,
          channels: []
        };
      }

      this.clients[keyToUse]["channels"][channel] = true;
      var data = {
        store: this.storeName,
        field: 'clients.' + keyToUse,
        value: this.clients[keyToUse]
      };
      //console.log(data);
      this.routerClient.query("storeService.setValue", data, {}, function (resp) {
        //console.log(resp);
      });
      this.updateListeners();
    }
  }]);

  return LinkerClient;
}();

/* harmony default export */ __webpack_exports__["default"] = (LinkerClient);

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! exports provided: default, router, LinkerClient, LauncherClient */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _routerClient_routerClientInstance__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./routerClient/routerClientInstance */ "./routerClient/routerClientInstance.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "router", function() { return _routerClient_routerClientInstance__WEBPACK_IMPORTED_MODULE_0__["router"]; });

/* harmony import */ var _clientBridge_linkerClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./clientBridge/linkerClient */ "./clientBridge/linkerClient.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LinkerClient", function() { return _clientBridge_linkerClient__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _clientBridge_launcherClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./clientBridge/launcherClient */ "./clientBridge/launcherClient.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LauncherClient", function() { return _clientBridge_launcherClient__WEBPACK_IMPORTED_MODULE_2__["default"]; });




/* harmony default export */ __webpack_exports__["default"] = ({
  router: _routerClient_routerClientInstance__WEBPACK_IMPORTED_MODULE_0__["router"],
  LinkerClient: _clientBridge_linkerClient__WEBPACK_IMPORTED_MODULE_1__["default"],
  LauncherClient: _clientBridge_launcherClient__WEBPACK_IMPORTED_MODULE_2__["default"]
});


/***/ }),

/***/ "./routerClient/routerClientConstructor.js":
/*!*************************************************!*\
  !*** ./routerClient/routerClientConstructor.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

exports.__esModule = true;

var routerTransport_1 = __webpack_require__(/*! ./routerTransport */ "./routerClient/routerTransport.js");

var queue = []; // should never be used, but message sent before router ready will be queue

/**
 *
 * ## Router Client
 *
 * The Router Client sends and receives event messages between Finsemble components and services. See the <a href=tutorial-TheRouter.html>Router tutorial</a> for an overview of the Router's functionality.
 *
 * Router callbacks for incoming messages are **always** in the form `callback(error, event)`. If `error` is null, then the incoming data is always in `event.data`. If `error` is set, it contains a diagnostic object and message. On error, the `event` parameter is not undefined.
 *
 *
 * @constructor
 * @hideconstructor
 * @publishedName RouterClient
 * @param {string} clientName Router base client name for human readable messages (window name is concatenated to baseClientName)
 * @param {string=} transportName Router transport name, always "SharedWorker"
 */

exports.RouterClientConstructor = function (params) {
  var _this = this; ///////////////////////////
  // Private Data
  ///////////////////////////


  var baseClientName = params.clientName;
  var transportName = params.transportName;
  var handshakeHandler;
  var timeCalibrationHandler;
  var mapListeners = {};
  var mapResponders = {};
  var mapPubSubResponders = {};
  var mapPubSubResponderState = {};
  var mapPubSubResponderRegEx = {};
  var pubsubListOfSubscribers = {};
  var mapSubscribersID = {};
  var mapSubscribersTopic = {};
  var mapQueryResponses = {};
  var mapQueryResponseTimeOut = {};
  var clientName;
  var transport = null;
  var isRouterReady = false;
  var parentReadyCallbackQueue = []; // must be queue because may be multiple waiters

  var self = this;
  this.startupTime = 0;
  var UUID = create_UUID(); /////////////////////////////////////////////////////////////////////
  // Private Message Contructors for Communicating with RouterService
  /////////////////////////////////////////////////////////////////////

  function InitialHandshakeMessage() {
    this.header = {
      "origin": clientName,
      "type": "initialHandshake"
    };
  }

  function TimeCalibrationHandshakeMessage(clientBaseTime, serviceBaseTime) {
    this.header = {
      "origin": clientName,
      "type": "timeCalibration"
    };
    this.clientBaseTime = clientBaseTime;
    this.serviceBaseTime = serviceBaseTime;
  }

  function AddListenerMessage(channel) {
    this.header = {
      "origin": clientName,
      "type": "addListener",
      "channel": channel
    };
  }

  function TransmitMessage(toChannel, data, options) {
    this.header = {
      "origin": clientName,
      "type": "transmit",
      "channel": toChannel
    };
    this.data = data;
    this.options = options;
  }

  function RemoveListenerMessage(channel) {
    this.header = {
      "origin": clientName,
      "type": "removeListener",
      "channel": channel
    };
  }

  function addResponderMessage(channel) {
    this.header = {
      "origin": clientName,
      "type": "addResponder",
      "channel": channel
    };
  }

  function QueryMessage(queryID, channel, data) {
    this.header = {
      "origin": clientName,
      "type": "query",
      "queryID": queryID,
      "channel": channel
    };
    this.data = data;
  }

  function QueryResponseMessage(queryID, error, data) {
    this.header = {
      "origin": clientName,
      "type": "queryResponse",
      "queryID": queryID,
      "error": error
    };
    this.data = data;
  }

  function RemoveResponderMessage(channel) {
    this.header = {
      "origin": clientName,
      "type": "removeResponder",
      "channel": channel
    };
  }

  function SubscribeMessage(subscribeID, topic) {
    this.header = {
      "origin": clientName,
      "type": "subscribe",
      "subscribeID": subscribeID,
      "topic": topic
    };
  }

  function UnsubscribeMessage(subscribeID, topic) {
    this.header = {
      "origin": clientName,
      "type": "unsubscribe",
      "subscribeID": subscribeID,
      "topic": topic
    };
  }

  function PublishMessage(topic, data) {
    this.header = {
      "origin": clientName,
      "type": "publish",
      "topic": topic
    };
    this.data = data;
  }

  function NotifyMessage(subscribeID, topic, error, data) {
    this.header = {
      "origin": clientName,
      "type": "notify",
      "subscribeID": subscribeID,
      "topic": topic,
      "error": error
    };
    this.data = data;
  }

  function AddPubSubResponderMessage(topic) {
    this.header = {
      "origin": clientName,
      "type": "addPubSubResponder",
      "topic": topic
    };
  }

  function RemovePubSubResponderMessage(topic) {
    this.header = {
      "origin": clientName,
      "type": "removePubSubResponder",
      "topic": topic
    };
  }

  function JoinGroupMessage(group) {
    this.header = {
      "origin": clientName,
      "type": "joinGroup",
      "group": group
    };
  }

  function LeaveGroupMessage(group) {
    this.header = {
      "origin": clientName,
      "type": "leaveGroup",
      "group": group
    };
  }

  function GroupTransmitMessage(group, toChannel, message, data) {
    this.header = {
      "origin": clientName,
      "type": "groupTransmit",
      "group": group,
      "channel": toChannel
    };
    this.data = data;
  } //////////////////////
  // Private Functions
  //////////////////////
  // router client is being terminated so cleanup


  function destructor(event) {
    //console.log("WINDOW LIFECYCLE:Shutdown:RouterClient:Shutting down.");
    self.disconnectAll(); // this will let the router know the client is terminating
  } // invoked when router init is complete


  function onReadyCallBack() {
    // self.startupTime = performance.now() - self.startupTime;
    //console.log("WINDOW LIFECYCLE:STARTUP:RouterClient Ready");
    isRouterReady = true; // invoke all the parent callbacks waiting for router to be ready

    while (parentReadyCallbackQueue.length > 0) {
      //console.log("WINDOW LIFECYCLE:STARTUP:RouterClient parentReady invoked");
      var nextParentCallback = parentReadyCallbackQueue.shift();
      nextParentCallback();
    }
  } // called once on router-client creation


  function constructor(clientName, transportName) {
    //console.log("WINDOW LIFECYCLE:STARTUP:RouterClient Constructor:Name:", clientName);

    function processManifest() {
      //console.log("WINDOW LIFECYCLE:STARTUP:RouterClient:processManifest"); //If manifest is a string, then there was an error getting the manifest because in a separate application

      asyncConnectToEventRouter(clientName, transportName, onReadyCallBack);
      /**** establish connection to router service ****/
    }

    processManifest();
  }

  function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
  } // connects to event-router service. will retry various ways if needed


  function asyncConnectToEventRouter(clientName, transportName, onReadyCallBack) {
    var myTimer;
    var myRetryCounter;
    var isFinished = false;
    var handshakeFailedCount = 0;
    var routerParams = {
      FinsembleUUID: UUID,
      applicationRoot: "ws://127.0.0.1:3376",
      routerDomainRoot: "localhost",
      forceWindowTransport: {},
      sameDomainTransport: "SharedWorker",
      crossDomainTransport: "FinsembleTransport",
      transportSettings: {},
      IAC: {}
    };

    function getClientTransport() {
      transport = routerTransport_1["default"].getTransport(routerParams, transportName, incomingMessageHandler, clientName, "RouterService").then(transportReady)["catch"](errHandler);
    }

    function transportReady(transportObj) {
      myRetryCounter = 0;
      transport = transportObj;
      handshakeHandler = finished; // set function to receive handshake response

      sendHandshake();
      myTimer = setInterval(sendHandshake, 200); // start time to retry if response not recieved back from router service
    }

    function handshakeFailedHandler() {
      clearInterval(myTimer);
      handshakeFailedCount++;

      if (handshakeFailedCount <= 3) {
        getClientTransport();
      } else {
        console.warn("error connecting to the transport");
      }
    }

    function sendHandshake() {
      sendToRouterService(new InitialHandshakeMessage());

      if (myRetryCounter++ > 50) {
        handshakeFailedHandler();
      }
    }

    function finished() {
      if (!isFinished) {
        // ensure only invoked once
        isFinished = true;
        clearInterval(myTimer);

        if (queue) {
          // this should not happen with proper startup order, which waits on routerClient to be ready
          for (var i = 0; i < queue.length; i++) {
            var msg = queue[i];
            transport.send(msg);
          }
        } // notify initialization is complete


        if (onReadyCallBack) {
          onReadyCallBack();
        }
      }
    }

    function errHandler(errorMessage) {
      //console.log("RouterClientError", errorMessage);
    } // main code for this asyncConnectToEventRouter function -- only executed once


    getClientTransport();
  } // provides unique id within one router client for queries


  function clientID() {
    return clientName + "." + UUID;
  } // returns true if this routerClient originated the message


  function originatedHere() {
    return this.header.origin === this.header.lastClient;
  } // invoke client callbacks in the input array (that are attached to a specific channel and listener type)


  function invokeListenerCallbacks(map, message) {
    var originalClientCallbackArray = map[message.header.channel] || [];
    var clientCallbackArray = [];

    if (clientCallbackArray === undefined) {} else {
      message.originatedHere = originatedHere; // add local function to test origin
      //@note, have to operate off of a copy because a callback may call removeListener, which will modify map[message.header.channel].

      originalClientCallbackArray.forEach(function (cb) {
        clientCallbackArray.push(cb);
      });

      for (var i = 0; i < clientCallbackArray.length; i++) {
        // for each callback defined for the channel
        clientCallbackArray[i](null, message); // invoke the callback; the error parameter is always null for this case
      }
    }
  }

  function sendQueryResponse(err, responseData) {
    //@todo consider removing this log. Why log it? Why not log it _only_ if the dev wants a particular message logged. This can cause problems.
    sendToRouterService(new QueryResponseMessage(this.header.queryID, err, responseData));
  } // invoke responder-listener callback (attached to a specific channel)


  function invokeResponderCallback(map, queryMessage) {
    var responderCallback = map[queryMessage.header.channel];

    if (responderCallback === undefined) {
      //responderCallback(null, queryMessage); // invoke the callback (no error), queryMessage);
    } else {
      if (!queryMessage.header.error) {
        queryMessage.originatedHere = originatedHere; // add local function to test origin

        queryMessage.sendQueryResponse = sendQueryResponse.bind(queryMessage); // add callback function to message so responder can respond to query

        responderCallback(null, queryMessage); // invoke the callback (no error)
      } else {
        // invoke the callback with error since  flag in message (from router service)
        responderCallback(queryMessage.header.error, null);
        delete map[queryMessage.header.channel]; // this is a bad responder (e.g. duplicate) so remove it
      }
    }
  } // add a callbackHandler into the query-response map for the given queryID


  function addQueryResponseCallBack(map, queryID, responseCallback) {
    map[queryID] = responseCallback;
  } // add timer to wait for query response


  function addQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID, channel, timeout) {
    if (timeout > 0) {
      mapQueryResponseTimeOut[newQueryID] = setTimeout(function () {
        ////console.log("RouterClient: timeout waiting on query response on channel " + channel + " for queryID " + newQueryID + " on timer " + mapQueryResponseTimeOut[newQueryID] + " timeout=" + timeout);
      }, timeout);
    }
  } // delete timer waiting on query response (if it exists)


  function deleteQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID) {
    var theTimer = mapQueryResponseTimeOut[newQueryID];

    if (theTimer !== undefined) {
      clearTimeout(theTimer);
    }
  } // invoke query-response callback (that is attached to a specific channel and listener type)


  function invokeQueryResponseCallback(map, responseMessage) {
    var clientCallback = map[responseMessage.header.queryID];

    if (clientCallback === undefined) {
      ////console.log("RouterClient: no handler for incoming query response", "QUERY ID", responseMessage.header.queryID);
    } else {
      // delete any existing timer waiting on the response
      deleteQueryResponseTimeout(mapQueryResponseTimeOut, responseMessage.header.queryID);

      if (!responseMessage.header.error) {
        //@todo consider removing this log. Why log it? Why not log it _only_ if the dev wants a particular message logged. This can cause problems.
        //////console.log("RouterClient: incoming query response", "RESPONSE MESSAGE", responseMessage, "QUERY ID", responseMessage.header.queryID);
        clientCallback(null, responseMessage); // invoke the callback passing the response message
      } else {
        ////console.log("RouterClient: incoming queryResponse error", responseMessage.header, "QUERY ID", responseMessage.header.queryID);
        clientCallback(responseMessage.header.error, responseMessage); // error from router service so pass it back instead of a message
      }

      delete map[responseMessage.header.queryID];
    }
  } // add responder callbackHandler for the given channel


  function addResponderCallBack(map, channel, callback) {
    var status = false;
    var clientCallback = map[channel];

    if (clientCallback === undefined) {
      map[channel] = callback;
      status = true;
    }

    return status;
  } // support function for sendNotifyToSubscriber -- maintains local list of subscribers for pubsub responder


  function addToPubSubListOfSubscribers(pubsubListOfSubscribers, topic, subscribeID) {
    if (!(topic in pubsubListOfSubscribers)) {
      pubsubListOfSubscribers[topic] = [subscribeID];
    } else {
      pubsubListOfSubscribers[topic].push(subscribeID);
    }
  } // support function for addPubSubResponder -- add pubsub responder callbackHandler for the given channel


  function addPubSubResponderCallBack(topic, subscribeCallback, publishCallback, unsubscribeCallback) {
    var status = false;
    var callbacks = mapPubSubResponders[topic.toString()];

    if (callbacks === undefined) {
      if (topic instanceof RegExp) {
        mapPubSubResponderRegEx[topic.toString()] = topic;
        ////console.log("RouterClient: PubSub RegEx added for topic " + topic.toString()); // Note: topic may be a RegEx, so use toString() where applicable
      }

      mapPubSubResponders[topic.toString()] = {
        "subscribeCallback": subscribeCallback,
        "publishCallback": publishCallback,
        "unsubscribeCallback": unsubscribeCallback
      };
      status = true;
    }

    return status;
  } // callback function for invokeSubscribePubSubCallback to notify new subscriber


  function sendNotifyToSubscriber(err, notifyData) {
    //@todo consider removing this log. Why log it? Why not log it _only_ if the dev wants a particular message logged. This can cause problems.
    sendToRouterService(new NotifyMessage(this.header.subscribeID, this.header.topic, err, notifyData));

    if (!err) {
      // add new subscriber to list
      addToPubSubListOfSubscribers(pubsubListOfSubscribers, this.header.topic, this.header.subscribeID);
      ////console.log("RouterClient: incoming subscription added", "TOPIC", this.header.topic, "MESSAGE", this);
    } else {
      ////console.log("RouterClient: incoming subscription rejected by pubsub responder", "TOPIC", this.header.topic, "MESSAGE", this);
    }
  } // for incoming subscribe: invoke notify callback for pubsub responder


  function invokeSubscribePubSubCallback(subscribeMessage) {
    var callbacks = mapPubSubResponders[subscribeMessage.header.topic]; //@todo consider removing this log. Why log it? Why not log it _onlY_ if the dev wants a particular message logged. This can cause problems.

    if (callbacks === undefined) {
      // if undefined then may be a matching RegEx topic
      for (var key in mapPubSubResponderRegEx) {
        if (mapPubSubResponderRegEx[key].test(subscribeMessage.header.topic)) {
          callbacks = mapPubSubResponders[key];
          var initialState = mapPubSubResponderState[subscribeMessage.header.topic]; // may already be initial state defined from publish

          if (initialState === undefined) {
            // if there isn't already state defined then use default from regEx
            initialState = mapPubSubResponderState[key]; // initialize the state from RegEx topic
          }

          mapPubSubResponderState[subscribeMessage.header.topic] = initialState;
          break;
        }
      }
    }

    if (callbacks === undefined) {
      // if still undefined
      ////console.log("RouterClient: no pubsub responder defined for incoming subscribe", subscribeMessage);
    } else {
      if (subscribeMessage.header.error) {
        // the router service uses the subscribe message in this case to return a pubsub error (ToDO: consider a generic error message)
        ////console.log("RouterClient: pubsub error received from router service: " + JSON.stringify(subscribeMessage.header.error));
      } else {
        subscribeMessage.sendNotifyToSubscriber = sendNotifyToSubscriber; // add callback function to message so pubsub responder can respond with Notify message

        if (callbacks.subscribeCallback) {
          subscribeMessage.data = mapPubSubResponderState[subscribeMessage.header.topic];
          callbacks.subscribeCallback(null, subscribeMessage); // invoke the callback (no error)
        } else {
          // since no subscribe callback defined, use default functionality
          subscribeMessage.sendNotifyToSubscriber(null, mapPubSubResponderState[subscribeMessage.header.topic]); // must invoke from message to set this properly
        }
      }
    }
  } // support function for removeSubscriber callback --  remove one subscribeID from array for the given subscription topic


  function removeFromPubSubListOfSubscribers(pubsubListOfSubscribers, topic, subscribeID) {
    var removed = false;

    if (topic in pubsubListOfSubscribers) {
      var list = pubsubListOfSubscribers[topic];

      for (var i = 0; i < list.length; i++) {
        if (subscribeID === list[i]) {
          list.splice(i, 1);

          if (list.length === 0) {
            delete pubsubListOfSubscribers[topic];
          }

          removed = true;
          ////console.log("RouterClient: PubSub removeListener", "TOPIC", topic, "FROM", subscribeID);
          break;
        }
      }
    }

    if (!removed) {
      //console.log("RouterClient: tried to remove non-existant listener on " + topic + " from " + JSON.stringify(subscribeID));
    }
  } // callback function for invokeUnsubscribePubSubCallback to remove the subscriber from the subscription


  function removeSubscriber() {
    removeFromPubSubListOfSubscribers(pubsubListOfSubscribers, this.header.topic, this.header.subscribeID);
  } // for incoming unsubscribe: invoke unsubscribe callback for pubsub service


  function invokeUnsubscribePubSubCallback(unsubscribeMessage) {
    var callbacks = mapPubSubResponders[unsubscribeMessage.header.topic];

    if (callbacks === undefined) {
      // if undefined then may be a matching RegEx topic
      for (var key in mapPubSubResponderRegEx) {
        if (mapPubSubResponderRegEx[key].test(unsubscribeMessage.header.topic)) {
          callbacks = mapPubSubResponders[key];
          break;
        }
      }
    }

    if (callbacks === undefined) {
      // if still undefined
      //console.log("RouterClient: no pubsub responder defined for incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
    } else {
      unsubscribeMessage.removeSubscriber = removeSubscriber; // add callback function to message for pubsub responder (but must always remove)

      if (callbacks.unsubscribeCallback) {
        //console.log("RouterClient: incoming unsubscribe callback", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
        callbacks.unsubscribeCallback(null, unsubscribeMessage); // invoke the callback (no error)
      } else {
        // since no unsubscribe callback defined, use default functionality
        //console.log("RouterClient: incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
        unsubscribeMessage.removeSubscriber();
      }
    }
  } // callback function for invokePublishPubSubCallback to send Notify


  function sendNotifyToAllSubscribers(err, notifyData) {
    if (!err) {
      mapPubSubResponderState[this.header.topic] = notifyData; // store new state

      var listOfSubscribers = pubsubListOfSubscribers[this.header.topic];

      if (typeof listOfSubscribers !== "undefined") {
        // confirm subscribers to send to, if none then nothing to do
        for (var i = 0; i < listOfSubscribers.length; i++) {
          //console.log("RouterClient: sending pubsub notify", "TOPIC", this.header.topic, "NOTIFY DATA", notifyData);
          sendToRouterService(new NotifyMessage(listOfSubscribers[i], this.header.topic, err, notifyData));
        }
      }
    } else {
      //console.log("RouterClient: income publish rejected by pubsub responder", err, notifyData);
    }
  } // for incoming Publish: invoke publish callback for pubsub service


  function invokePublishPubSubCallback(publishMessage) {
    var callbacks = mapPubSubResponders[publishMessage.header.topic];

    if (callbacks === undefined) {
      // if undefined then may be a matching RegEx topic
      for (var key in mapPubSubResponderRegEx) {
        if (mapPubSubResponderRegEx[key].test(publishMessage.header.topic)) {
          callbacks = mapPubSubResponders[key];
          break;
        }
      }
    }

    if (callbacks === undefined) {
      // if still undefined
      //console.log("RouterClient: no pubsub responder defined for incoming publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
    } else {
      publishMessage.sendNotifyToAllSubscribers = sendNotifyToAllSubscribers; // add callback function to message so pubsub responder can respond to publish

      if (callbacks.publishCallback) {
        //console.log("RouterClient: incoming PubSub publish callback invoked", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
        callbacks.publishCallback(null, publishMessage); // invoke the callback (no error)
      } else {
        // since no pubish callback defined, use default functionality
        //console.log("RouterClient: incoming PubSub publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
        publishMessage.sendNotifyToAllSubscribers(null, publishMessage.data); // must call from publish message (like a callback) so 'this' is properly set
      }
    }
  } // for incoming Notify: invoke notify callback (that are attached to a specific channel and listener type)


  function invokeNotifyCallback(mapSubscribersID, notifyMessage) {
    var notifyCallback = mapSubscribersID[notifyMessage.header.subscribeID];

    if (notifyCallback === undefined) {
      //console.log("RouterClient: no subscription handler defined for incoming notify for subscriberID", notifyMessage.header.subscribeID, notifyMessage);
    } else {
      if (!notifyMessage.header.error) {
        notifyMessage.originatedHere = originatedHere; // add local function to test origin

        //console.log("RouterClient: incoming PubSub notify", "SUBSCRIBER ID", notifyMessage.header.subscribeID, "NOTIFY MESSAGE", notifyMessage);
        notifyCallback(null, notifyMessage); // invoke the callback passing the response message
      } else {
        //console.log("RouterClient: incoming PubSub notify error for subscriberID", "SUBSCRIBER ID", notifyMessage.header.subscribeID, "NOTIFY MESSAGE", notifyMessage);
        notifyCallback(notifyMessage.header.error, notifyMessage); // error from router service so pass it back instead of a message
      }
    }
  } // outgoing Unsubscribe: remove subscriber callbackHandler for the given channel


  function removeSubscriberCallBack(mapSubscribersID, subscribeID) {
    var status = false;
    var notifyCallback = mapSubscribersID[subscribeID];

    if (notifyCallback !== undefined) {
      delete mapSubscribersID[subscribeID];
      status = true;
    }

    return status;
  } // for outgoing addSubscriber -- add a callback Handler for the subscribe


  function addSubscriberCallBack(mapSubscribersID, subscribeID, notifyCallback, topic) {
    mapSubscribersID[subscribeID] = notifyCallback;
    mapSubscribersTopic[subscribeID] = topic;
  } // for removePubSubResponder: remove responder callbackHandler for the given channel


  function removeResponderCallBack(map, channel) {
    var status = false;
    var clientCallback = map[channel];

    if (clientCallback !== undefined) {
      delete map[channel];
      status = true;
    }

    return status;
  } // for addListener: add a callbackHandler into the specified map (which depends on listener type) for the given channel


  function addListenerCallBack(map, channel, callback) {
    var firstChannelClient = false;
    var clientCallbackArray = map[channel];

    if (clientCallbackArray === undefined || clientCallbackArray.length === 0) {
      map[channel] = [callback];
      firstChannelClient = true;
    } else {
      clientCallbackArray.push(callback);
    }

    return firstChannelClient;
  } // for removeListener: remove a callbackHandler from the specified map (which depends on listener type) for the given channel


  function removeListenerCallBack(map, channel, callback) {
    var lastChannelClient = false;
    var clientCallbackArray = map[channel];

    if (clientCallbackArray !== undefined) {
      var index = clientCallbackArray.indexOf(callback);

      if (index > -1) {
        clientCallbackArray.splice(index, 1);

        if (clientCallbackArray.length === 0) {
          lastChannelClient = true;
        }
      } else {
        //console.log("no listener defined for channel: " + channel);
      }
    }

    return lastChannelClient;
  } // route incoming message to appropriate callback, which depends on the message type and channel


  function routeIncomingMessage(incomingMessage) {
    //console.log("Incoming Message Type", incomingMessage.header.type, incomingMessage);

    switch (incomingMessage.header.type) {
      case "transmit":
        invokeListenerCallbacks(mapListeners, incomingMessage);
        break;

      case "query":
        invokeResponderCallback(mapResponders, incomingMessage);
        break;

      case "queryResponse":
        invokeQueryResponseCallback(mapQueryResponses, incomingMessage);
        break;

      case "notify":
        invokeNotifyCallback(mapSubscribersID, incomingMessage);
        break;

      case "publish":
        invokePublishPubSubCallback(incomingMessage);
        break;

      case "subscribe":
        invokeSubscribePubSubCallback(incomingMessage);
        break;

      case "unsubscribe":
        invokeUnsubscribePubSubCallback(incomingMessage);
        break;

      case "timeCalibration":
        timeCalibrationHandler(incomingMessage);
        break;

      case "initialHandshakeResponse":
        handshakeHandler();
        break;

      default:
    }
  }

  function clone(from, to) {
    if (from === null || _typeof(from) !== "object") {
      return from;
    } // if (from.constructor != Object && from.constructor != Array) return from;


    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function || from.constructor == String || from.constructor == Number || from.constructor == Boolean) {
      return new from.constructor(from);
    }

    to = to || new from.constructor();

    for (var n in from) {
      to[n] = typeof to[n] === "undefined" ? clone(from[n], null) : to[n];
    }

    return to;
  } // *** all incoming messages from underlying transport arrive here ***
  // although incoming transport information is available, it is not passed on because not needed


  function incomingMessageHandler(incomingTransportInfo, message) {
    // ToDo: good place to put a function to validate incoming message/data
    message.header.lastClient = clientName; // add last client for diagnostics

    message.header.incomingTransportInfo = incomingTransportInfo;
    routeIncomingMessage(message);
  } // *** all outbound messages exit here though the appropriate transport ***


  function sendToRouterService(message) {
    if (!transport || transport instanceof Promise) {
      //console.log("RouterClient: Queuing message since router initialization not complete", message);
      queue.push(message);
    } else {
      transport.send(message);
    }
  }
  /**
   * Estimates offset to align the reference time with Router Service.  Does this by exchanging messages with RouterService, getting the service's time, and estimating communication delay.
   *
   * @private
   */


  this.calibrateTimeWithRouterService = function (callback) {
    var TARGET_HANDSHAKE_COUNT = 5;
    var handshakeCounter = 0;
    var timeOffset;
    var offsetForFastest;
    var fastestRRT = Infinity;

    function calibrationCalculation(finalHandshakeMessage) {
      var timeOffset = 0;

      for (var i = 1; i < TARGET_HANDSHAKE_COUNT; i++) {
        var startClientTime = finalHandshakeMessage.clientBaseTime[i - 1];
        var stopClientTime = finalHandshakeMessage.clientBaseTime[i];
        var rtt = stopClientTime - startClientTime; // round-trip time

        var serviceTime = finalHandshakeMessage.serviceBaseTime[i - 1];
        var offset = serviceTime - (startClientTime + rtt / 2);

        if (rtt < fastestRRT) {
          fastestRRT = rtt;
          offsetForFastest = offset;
        }

        timeOffset += offset;
        //console.log("calibrationCalculation Intermediate Values", "lastRRT", rtt, "lastOffset", offset, "fastestOffset", offsetForFastest, "fastestRRT", fastestRRT);
      }

      timeOffset /= TARGET_HANDSHAKE_COUNT - 1;
      //console.log("RouterClient calibrationCalculation", "Average Offset", timeOffset, "Chosen FastestOffset", offsetForFastest, finalHandshakeMessage);
      callback(offsetForFastest); // use the offset with the shortest RTT since it is often the most accurate
    }

    function timeCalibrationHandlerFunction(message) {
      handshakeCounter++;

      if (handshakeCounter > TARGET_HANDSHAKE_COUNT) {
        calibrationCalculation(message); // enough handshake data gather, so do the calibration
      } else {
        // message.clientBaseTime.push(window.performance.timing.navigationStart + window.performance.now());
        sendToRouterService(new TimeCalibrationHandshakeMessage(message.clientBaseTime, message.serviceBaseTime));
      }
    }

    timeCalibrationHandler = timeCalibrationHandlerFunction; // used in routeIncomingMessage to route handshake response back to handler

    timeCalibrationHandler(new TimeCalibrationHandshakeMessage([], [])); // invoke first time to start exchanging handshakes; will be invoked each time handshake message received back from FouterService
  };
  /**
   * Backward compatibility?
   * @private
   */


  this.ready = function (cb) {
    return _this.onReady(cb);
  };
  /**
  * Get router client name.
  *
  * @param {string} newClientName string identify the client
  * FSBL.Clients.RouterClient.setClientName("MyComponent");
  * @private
  */


  this.getClientName = function () {
    //console.log("RouterClient.getClientName", clientName);
    return clientName;
  }; /////////////////////////////////////////////
  // Public Functions -- The Router Client API
  /////////////////////////////////////////////

  /**
   * Checks if router is ready. May be invoked multiple times. Invokes cb when ready, which may be immediately.  Router is not ready until underlying transport to router service is ready.
   *
   * @param {function} cb callback function to invoke when router is ready
   */


  this.onReady = function (cb) {
    // Validate.args(cb, "function");
    if (isRouterReady) {
      cb();
    } else {
      parentReadyCallbackQueue.push(cb);
    }
  };
  /**
   * Add listener for incoming transmit events on specified channel. Each of the incoming events will trigger the specified event handler. The number of listeners is not limited (either local to this Finsemble window or in a separate Finsemble window).
   *
   * See [transmit]{@link RouterClientConstructor#transmit} for sending a corresponding event message to listener. See [removeListener]{@link RouterClientConstructor#removeListener} to remove the listener.
   *
   * @param {string} channel any unique string to identify the channel (must match correspond transmit channel name)
   * @param {function} eventHandler function (see example below)
   * @example
   *
   * FSBL.Clients.RouterClient.addListener("SomeChannelName", function (error, response) {
   * 	if (error) {
   *			//console.log("ChannelA Error: " + JSON.stringify(error));
   *		} else {
   *			var data = response.data;
   *			//console.log("ChannelA Response: " + JSON.stringify(response));
   *		}
   * });
   *
   */


  this.addListener = function (channel, eventHandler) {
    //console.log("RouterClient.addListener", "CHANNEL", channel); // Validate.args(channel, "string", eventHandler, "function");

    var firstChannelClient = addListenerCallBack(mapListeners, channel, eventHandler);

    if (firstChannelClient) {
      sendToRouterService(new AddListenerMessage(channel));
    }
  };
  /**
   * Transmit event to all listeners on the specified channel. If no listeners the event is discarded without error. All listeners to the channel in this Finsemble window and other Finsemble windows will receive the transmit.
   *
   * See [addListener]{@link RouterClientConstructor#addListener} to add a listener to receive the transmit.
   *
   * @param {string} toChannel any unique string to identify the channel (must match correspond listener channel name)
   * @param {any} event any object or primitive type to be transmitted
   * @param {object} [options] Options object for your transmit
   * @param {boolean} [options.suppressWarnings=false] By default, the Router will log warnings if you transmit to a channel with no listeners. Set this to true to eliminate those warnings.
   * @example
   *
   * FSBL.Clients.RouterClient.transmit("SomeChannelName", event);
   *
   */


  this.transmit = function (toChannel, event, options) {
    // if (!Logger.isLogMessage(toChannel)) { // logger messages
    if (options === void 0) {
      options = {
        suppressWarnings: false
      };
    }

    //console.log("RouterClient.transmit", "TO CHANNEL", toChannel, "EVENT", event); // }
    // Validate.args(toChannel, "string", event, "any");

    sendToRouterService(new TransmitMessage(toChannel, event, options));
  };
  /**
   * Remove event listener from specified channel for the specific event handler (only listeners created locally can be removed).
   *
   * See [addListener]{@link RouterClientConstructor#addListener} for corresponding add of a listener.
   *
   * @param {string} channel unique channel name to remove listener from
   * @param {function} eventHandler function used for the event handler when the listener was added
   */


  this.removeListener = function (channel, eventHandler) {
    //console.log("RouterClient.removelistener", "CHANNEL", channel, "EVENT HANDLER", eventHandler);
    var lastChannelListener = removeListenerCallBack(mapListeners, channel, eventHandler);

    if (lastChannelListener) {
      sendToRouterService(new RemoveListenerMessage(channel));
    }
  };
  /**
   * Add a query responder to the specified channel. The responder's queryEventHander function will receive all incoming queries for the specified channel (whether from this Finsemble window or remote Finsemble windows).
   *
   * *Note:* Only one responder is allowed per channel within the Finsemble application.
   *
   * See [query]{@link RouterClientConstructor#query} for sending a corresponding query-event message to this responder.
   *
   * @param {string} channel any unique string to identify the channel (must match correspond query channel name); only one responder allower per channel
   * @param {function} queryEventHandler function to handle the incoming query (see example below); note incoming queryMessage contains function to send response
   * @example
   *
   * FSBL.Clients.RouterClient.addResponder("ResponderChannelName", function (error, queryMessage) {
   *	if (error) {
   *		//console.log('addResponder failed: ' + JSON.stringify(error));
   *	} else {
   *	//console.log("incoming data=" + queryMessage.data);
   * 	var response="Back at ya"; // Responses can be objects or strings
   *	queryMessage.sendQueryResponse(null, response); // A QUERY RESPONSE MUST BE SENT OR THE REMOTE SIDE WILL HANG
   *	}
   * });
   *
   */


  this.addResponder = function (channel, queryEventHandler) {
    //console.log("RouterClient.addResponder", "CHANNEL", channel); // Validate.args(channel, "string", queryEventHandler, "function");

    var status = addResponderCallBack(mapResponders, channel, queryEventHandler);

    if (status) {
      sendToRouterService(new addResponderMessage(channel));
    } else {
      //console.log("RouterClient.addResponder: Responder already locally defined for channel " + channel);
      queryEventHandler({
        "RouteClient QueryError": "Responder already locally defined for channel" + channel
      }, null); // immediately invoke callback passing error
    }
  };
  /**
   * Send a query to responder listening on specified channel. The responder may be in this Finsemble window or another Finsemble window
   *
   * See [addResponder]{@link RouterClientConstructor#addResponder} to add a responder to receive the query.
   *
   * @param {string} responderChannel a unique string that identifies the channel (must match the channel name on which a responder is listening)
   * @param {object} queryEvent event message sent to responder
   * @param {any} params optional params
   * @param {number} [params.timeout=20000]  timeout value for a query-response timer.  Timer defaults to 5000 milliseconds if no params value is passed in. Set timeout to zero to wait indefinitely. If the timer expires, this function call will return with an error.
   * @param {function} responseEventHandler event handler to receive the query response (sent from a responder that is listening on this channel)
   *
   * @example
   *
   * FSBL.Clients.RouterClient.query("someChannelName", {}, function (error, queryResponseMessage) {
   *	if (error) {
   *		//console.log('query failed: ' + JSON.stringify(error));
   *	} else {
   *		// process income query response message
   *		var responseData = queryResponseMessage.data;
   *		//console.log('query response: ' + JSON.stringify(queryResponseMessage));
   *	}
   * });
   *
   * FSBL.Clients.RouterClient.query("someChannelName", { queryKey: "abc123"}, { timeout: 1000 }, function (error, queryResponseMessage) {
   *	if (!error) {
   *		// process income query response message
   *		var responseData = queryResponseMessage.data;
   *	}
   * }); */


  this.query = function (responderChannel, queryEvent, params, responseEventHandler) {
    if (responseEventHandler === void 0) {
      responseEventHandler = Function.prototype;
    }

    var newQueryID = clientID() + "." + responderChannel; // var timestamp = window.performance.timing.navigationStart + window.performance.now();
    // var navstart = window.performance.timing.navigationStart;
    // var timenow = window.performance.now(); // these timer values used for logging diagnostics
    // //console.log("RouterClient.query", "RESPONDER CHANNEL", responderChannel, "QUERY EVENT", queryEvent, "PARAMS", params, "QUERYID", newQueryID, { timestamp, navstart, timenow });

    if (arguments.length === 3) {
      responseEventHandler = params;
      params = {
        timeout: 20000
      };
    }

    params = params || {};

    function promiseResolver(resolve) {
      //Allows us to await on queries, cleaning up code quite a bit.
      var modifiedHandler = function modifiedHandler(err, response) {
        resolve({
          err: err,
          response: response
        });
        responseEventHandler(err, response);
      };

      addQueryResponseCallBack(mapQueryResponses, newQueryID, modifiedHandler);
      addQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID, responderChannel, params.timeout);
      sendToRouterService(new QueryMessage(newQueryID, responderChannel, queryEvent));
    }

    return new Promise(promiseResolver);
  };
  /**
   * Remove query responder from specified channel. Only a locally added responder can be removed (i.e. a responder defined in the same component or service).
   *
   * See [addResponder]{@link RouterClientConstructor#addResponder} for corresponding add of a query responder.
   *
   * @param {string} responderChannel string identifying the channel to remove responder from
   *
   * @example
   *
   * FSBL.Clients.RouterClient.removeResponder("someChannelName");
   *
   */


  this.removeResponder = function (responderChannel) {
    //console.log("RouterClient.removeResponder", "RESPONDER CHANNEL", responderChannel);
    var status = removeResponderCallBack(mapResponders, responderChannel);

    if (status) {
      sendToRouterService(new RemoveResponderMessage(responderChannel));
    }
  };
  /**
   * Add a PubSub responder for specified topic. All subscribes and publishes to the topic will comes to responder (whether from local window or another window). Only one PubSub responder allowed per topic value in Finsemble application; however, the topic value may be a regular-expression representing a set of related topics, in which case the PubSub responder will responder to all matching topics. When a regEx topic is used, the same default functionality is provides for each matching topic -- the difference is only one PubSub responder is needed to cover a set of related topics, plus the same callback handers can be used (if provided).
   *
   * All the callback function are optional because each PubSub responder comes with build-in default functionality (described below).
   *
   * Note an exact topic match will take precedence over a regEx match, but otherwise results are unpredictable for overlapping RegEx topics.
   *
   * See [subscribe]{@link RouterClientConstructor#subscribe} and [publish]{@link RouterClientConstructor#publish} for corresponding functions sending to the PubSub responder.
   *
   * @param {string} topic unique topic for this responder, or a topic RegEx (e.g. '/abc.+/') to handle a set of topics
   * @param {object} [initialState] initial state for the topic (defaults to empty struct); can be any object
   * @param {object} [params] optional parameters
   * @param {function} [params.subscribeCallback] allows responder know of incoming subscription and accept or reject it (default is to accept)
   * @param {function} [params.publishCallback] allows responder to use the publish data to form a new state (default is the publish data becomes the new state)
   * @param {function} [params.unsubscribeCallback] allows responder to know of the unsubscribe, but it must be accepted (the default accepts)
   * @param {function} [callback] optional callback(err,res) function. If addPubSubResponder failed then err set; otherwise, res set to "success"
   *
   * @example
   *
   * function subscribeCallback(error, subscribe) {
   * 	if (subscribe) {
   * 		// must make this callback to accept or reject the subscribe (default is to accept). First parm is err and second is the initial state
   * 		subscribe.sendNotifyToSubscriber(null, { "NOTIFICATION-STATE": "One" });
   * 	}
   * }
   * function publishCallback(error, publish) {
   * 	if (publish) {
   * 		// must make this callback to send notify to all subscribers (if error parameter set then notify will not be sent)
   * 		publish.sendNotifyToAllSubscribers(null, publish.data);
   * 	}
   * }
   * function unsubscribeCallback(error, unsubscribe) {
   * 	if (unsubscribe) {
   * 		// must make this callback to acknowledge the unsubscribe
   * 		unsubscribe.removeSubscriber();
   * 	}
   * }
   * FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" },
   * 	{
   * 		subscribeCallback:subscribeCallback,
   * 		publishCallback:publishCallback,
   * 		unsubscribeCallback:unsubscribeCallback
   * 	});
   *
   *   or
   *
   * FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" });
   *
   *   or
   *
   * FSBL.Clients.RouterClient.addPubSubResponder(\/topicA*\/, { "State": "start" });
   *
   */


  this.addPubSubResponder = function (topic, initialState, params, callback) {
    var error;
    var response;
    //console.log("RouterClient.addPubSubResponder", "TOPIC", topic, "INITIAL STATE", initialState, "PARAMS", params);
    params = params || {};
    var status = addPubSubResponderCallBack(topic, params.subscribeCallback, params.publishCallback, params.unsubscribeCallback);

    if (status) {
      initialState = initialState || {};
      mapPubSubResponderState[topic.toString()] = clone(initialState, null);
      sendToRouterService(new AddPubSubResponderMessage(topic.toString()));
      response = "success";
    } else {
      error = "RouterClient.addPubSubResponder: Responder already locally defined for topic " + topic;
      //console.log(error);
    }

    if (callback) {
      callback(error, response);
    }
  };
  /**
   * Remove pubsub responder from specified topic. Only locally created responders (i.e. created in local window) can be removed.
   *
   * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder.
   *
   * @param {string} topic unique topic for responder being removed (may be RegEx, but if so much be exact regEx used previously with addPubSubResponder)
   *
   * @example
   *
   * FSBL.Clients.RouterClient.removePubSubResponder("topicABC");
   *
   */


  this.removePubSubResponder = function (topic) {
    //console.log("RouterClient.removePubSubResponder", "TOPIC", topic);
    var status = removeResponderCallBack(mapPubSubResponders, topic);

    if (status) {
      delete mapPubSubResponderState[topic.toString()]; // remove corresponding state

      delete mapPubSubResponderRegEx[topic.toString()]; // may be a RegEx

      sendToRouterService(new RemovePubSubResponderMessage(topic));
    } else {
      //console.log("RouterClient.removePubSubResponder failed: Could not find responder for topic " + topic);
    }
  };
  /**
   * Subscribe to a PubSub Responder. Each responder topic can have many subscribers (local in this window or remote in other windows). Each subscriber immediately (but asyncronouly) receives back current state in a notify; new notifys are receive for each publish sent to the same topic.
   *
   * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder to handle the subscribe. See [publish]{@link RouterClientConstructor#publish} for corresponding publish to notify the subscriber.
   *
   * @param {string} topic topic being subscribed to
   * @param {function} notifyCallback invoked for each income notify for the given topic (i.e. initial notify plus for each publish)
   * @returns {object} subscribe-id optionally used for unsubscribing later
   *
   * @example
   *
   * var subscribeId = RouterClient.subscribe("topicABC", function(err,notify) {
   *		if (!err) {
   *			var notificationStateData = notify.data;
   *			// do something with notify data
   *  	}
   * });
   *
   */


  this.subscribe = function (topic, notifyCallback) {
    //console.log("RouterClient.subscribe", "TOPIC", topic);
    var subscribeID = clientID();
    addSubscriberCallBack(mapSubscribersID, subscribeID, notifyCallback, topic);
    sendToRouterService(new SubscribeMessage(subscribeID, topic));
    return {
      "subscribeID": subscribeID,
      "topic": topic
    };
  };
  /**
   * Publish to a PubSub Responder, which will trigger a corresponding Notify to be sent to all subscribers (local in this window or remote in other windows). There can be multiple publishers for a topic (again, in same window or remote windows)
   *
   * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder to handle the publish (i.e. sending notifications to all subscriber). See [Subscribe]{@link RouterClientConstructor#addPubSubResponder} for corresponding subscription to receive publish results (in the form of a notify event)
   *
   * @param {string} topic topic being published to
   * @param {object} event topic state to be published to all subscriber (unless the SubPub responder optionally modifies in between)
   *
   * @example
   *
   * FSBL.Clients.RouterClient.publish("topicABC", topicState);
   *
   */


  this.publish = function (topic, event) {
    //console.log("RouterClient.publish", "TOPIC", topic, "EVENT", event);
    sendToRouterService(new PublishMessage(topic, event));
  };
  /**
   * Unsubscribe from PubSub responder so no more notifications received (but doesn't affect other subscriptions). Only works from the window the PubSub responder was created in.
   *
   * See [subscribe]{@link RouterClientConstructor#subscribe} for corresponding subscription being removed.
   *
   * @param {object} subscribeID the id return from the corresponding subscribe for the topic
   *
   * @example
   *
   * FSBL.Clients.RouterClient.unsubscribe(subscribeId);
   *
   */


  this.unsubscribe = function (subscribeIDStruct) {
    //console.log("RouterClient.unsubscribe", "SUBSCRIBE ID", subscribeIDStruct);
    var deletedSubscriber = removeSubscriberCallBack(mapSubscribersID, subscribeIDStruct.subscribeID);

    if (deletedSubscriber) {
      sendToRouterService(new UnsubscribeMessage(subscribeIDStruct.subscribeID, subscribeIDStruct.topic));
    } else {
      //console.log("RouterClient.unsubscribe: Could not find subscribeID for topic " + subscribeIDStruct.topic);
    }
  };
  /**
   * Test an incoming router message to see if it originated from the same origin (e.g. a trusted source...not cross-domain). Currently same origin is known only because a sharedWorker transport is used (by definition SharedWorkers do not work cross-domain).  This means any message coming in over the Inter-application Bus will not be trusted; however, by default all same-origin components and services connect to the router using a SharedWorker transport.
   * @param {object} incomingMessage an incoming router message (e.g. transmit, query, notification) to test to see if trusted.
   *
   * @example
   * FSBL.Clients.RouterClient.trustedMessage(incomingRouterMessage);
   */


  this.trustedMessage = function (incomingMessage) {
    var isTrusted = true; // temporarily make all trusted so no problems if changing router transport

    //console.log("RouterClient.trustedMessage header", incomingMessage.header);

    if (incomingMessage.header.originIncomingTransportInfo.transportID === "SharedWorker") {
      isTrusted = true;
    }

    return isTrusted;
  };
  /**
   * Removes all listeners, responders, and subscribers for this router client -- automatically called when client is shutting down. Can be called multiple times.
   */


  this.disconnectAll = function () {
    //console.log("RouterClient.disconnectAll");

    for (var channel in mapListeners) {
      //console.log("RouterClient.disconnectAll is removing listener on " + channel);
      sendToRouterService(new RemoveListenerMessage(channel));
      delete mapListeners[channel];
    }

    for (var responderChannel in mapResponders) {
      //console.log("RouterClient.disconnectAll is removing responder on " + responderChannel);
      sendToRouterService(new RemoveResponderMessage(responderChannel));
      delete mapResponders[responderChannel];
    }

    for (var topic in mapPubSubResponders) {
      //console.log("RouterClient.disconnectAll is removing pubsub responder on " + topic);
      sendToRouterService(new RemovePubSubResponderMessage(topic));
      delete mapPubSubResponders[topic.toString()]; // could be a RegEx

      delete mapPubSubResponderState[topic.toString()]; // remove corresponding state

      delete mapPubSubResponderRegEx[topic.toString()]; // may be a RegEx
    }

    for (var subscribeID in mapSubscribersID) {
      var stopic = mapSubscribersTopic[subscribeID];
      //console.log("RouterClient.disconnectAll is removing subscriber on " + stopic);
      sendToRouterService(new UnsubscribeMessage(subscribeID, stopic));
      delete mapSubscribersID[subscribeID];
      delete mapSubscribersTopic[subscribeID];
    }
  };

  clientName = baseClientName;
  constructor(clientName, "FinsembleTransport"); // constructor new router client

  return this;
};

/***/ }),

/***/ "./routerClient/routerClientInstance.js":
/*!**********************************************!*\
  !*** ./routerClient/routerClientInstance.js ***!
  \**********************************************/
/*! exports provided: router */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "router", function() { return RouterClientInstance; });

/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
// ? Had to remove because exports was not defined, not sure why I had to do this.
// exports.__esModule = true;

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

var routerClientConstructor_1 = __webpack_require__(/*! ./routerClientConstructor */ "./routerClient/routerClientConstructor.js");

var RCConstructor = routerClientConstructor_1.RouterClientConstructor;
/** An instance of the IRouterClient interface, (that is, the Router Client).
 * All other clients are built on top of the RouterClient; its API is the
 * primary form of communication between the various components of Finsemble.
 */

var RouterClientInstance = new RCConstructor({
  clientName: "RouterClient"
});
 // exports["default"] = RouterClientInstance;

/***/ }),

/***/ "./routerClient/routerTransport.js":
/*!*****************************************!*\
  !*** ./routerClient/routerTransport.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*! WSS://Chartiq.com
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
// This routerTransport module is shared between router clients and the router service.  It supports
// the addition of new transports without any change to the router code. Each transport is
// point-to-point between a router client and the router service (i.e. hub and spoke).  Each router
// client can use a different transport (i.e. the router service connects to them all).


exports.__esModule = true; // var WebSocket = require("ws");

/**
 * @introduction
 * <h2>Router Transport</h2>
 * **Service-Level Module**.  Manages and contains the point-to-point transports (i.e., Layer 2) supported by Finsemble.
 * Each transport communicates between a Finsemble services or component (i.e. a router client on one end) and the Finsemble router service (another router client on the other end).
 *
 * Integration into routerService.js is automatic on startup.
 *
 * Developer Notes on Adding New Transport:
 * 1) Create new transport constructor.
 * 2) Call RouterTransport.addTransport() to make the transport constructor (see the bottom of this file)
 *
 * Each transport constructor must be implemented with the following interface:
 *
 *	ExampleTransportConstructor(params, parentMessageHandler, source, destination) where
 *
 * 			params is a passed in object including data that may (or may not) be needed for implementing the transport
 * 					params.FinsembleUUID: globally unique identifier for Finsemble (one per host machine)
 *					params.applicationRoot:  value of manifest.finsemble.applicationRoot,
 *					params.routerDomainRoot: value of manifest.finsemble.moduleRoot,
 *					params.sameDomainTransport: transport to use for same domain clients
 *					params.crossDomainTransport: transport to use for cross domain clients
 *					params.transportSettings: transport settings from finsemble.router.transportSettings if defined, otherwise an empty object
 *
 * 			parentMessageHandler(incomingTransportInfo, routerMessage) where
 * 					incomingTransportInfo is a transport-specific object containing essential information to route back to the same client.
 * 						The same object will be returned on a send() so the transport can use to send the message to that client.
 * 						It's up to the developer to decide what to put in the incomingTransportInfo object. The RouterService never
 * 						directly uses the object, except to do a property-based comparison for equality (so equality must be based on the top-level properties within the object.)
 * 					routerMessage is an object containing a single router message. The transport generally does not need to know the contents --
 * 						it only sends and receives these messages. However, the router's header (routerMessage.header) is available to the transport if needed.
 *
 * 			source is either the source's client name or "RouterService" (when the RouterService is the source)
 *
 * 			destination is either the destination's client name or "RouterService" (when the RouterService is the desgination)
 *
 * 			callback(this) returns the constructor.  Normally a constructor is not asyncronous, but support in case the constructed transport requires async initialization.
 *
 * The transport constructor must implement two functions.
 * 		1) send(transport, routerMessage) -- transport object contains destination transport info; routerMessage is the message to send
 * 		2) identifier() -- returns transport's name
 *
 * These functions along with the parentMessageHandler callback all that's needed to interface with the higher-level router (either a client or router service):
 *
 * The three transports implemented at the bottom of this file can serve as examples.
 *
 * @namespace RouterTransport
 */

var RouterTransport = {
  activeTransports: {},

  /**
   * Adds a new type of router transport to pass message between RouterClient and RouterService.
   *
   * @param {string} transportName identifies the new transport
   * @param {object} transportConstructor returns an instance of the new transport
   */
  addTransport: function addTransport(transportName, transportConstructor) {
    this.activeTransports[transportName] = transportConstructor;
    //console.log("RouterTransport " + transportName + " added to activeTransports");
  },

  /**
   * Gets array of active transports.  What is active depends both on config and what is supported by the environment. Typically, if OF IAB is defined then the IAB transport is added to active list.  Likewise, if SharedWorker defined, then SharedWork transport added to the active list.  Special transports that don't have backwards compatability (e.g. FinsembleTransport) are only added if specified in the config.
   *
   * @param {string} params transport paramters
   *
   * @returns array of active transport names
   */
  getActiveTransports: function getActiveTransports(params) {
    var transportNames = []; // convenience funciton to add transport to active list only if it's not already in the list

    function addToActive(transportName) {
      if (transportNames.indexOf(transportName) === -1) {
        // if not already in the list, then add it
        transportNames.push(transportName);
      }
    } // add whatever the sameDomainTrasnport is to the active list


    addToActive(params.sameDomainTransport); // add whatever the crossDomainTrasnport is to the active list

    addToActive(params.crossDomainTransport);
    //console.log("getActiveTransports", transportNames);
    return transportNames;
  },

  /**
   * Get default transport for event router&mdash;this is the most reliable transport across all contexts.
   *
   * @param {object} params parameters for transport
   * @param {any} incomingMessageHandler
   * @param {any} source
   * @param {any} destination
   * @returns the transport object
   */
  getDefaultTransport: function getDefaultTransport(params, incomingMessageHandler, source, destination) {
    return RouterTransport.getTransport(params, "FinsembleTransport", incomingMessageHandler, source, destination);
  },

  /**
   * Get best client transport based on the run-time context. Will only return cross-domain transport if current context is inter-domain.
   *
   * @param {object} params parameters for transport
   * @param {any} incomingMessageHandler
   * @param {any} source
   * @param {any} destination
   * @returns the transport object
   */
  getRecommendedTransport: function getRecommendedTransport(params, incomingMessageHandler, source, destination) {
    return RouterTransport.getDefaultTransport(params, incomingMessageHandler, source, destination);
  },

  /**
   * Get a specific transport by name. The transport must be in list of the active transports (i.e. previously added).
   *
   * @param {object} params parameters for transport
   * @param {any} transportName
   * @param {any} incomingMessageHandler
   * @param {any} source
   * @param {any} destination
   * @returns the transport object
   */
  getTransport: function getTransport(params, transportName, incomingMessageHandler, source, destination) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var transportConstructor = self.activeTransports[transportName];

      if (transportConstructor) {
        new transportConstructor(params, incomingMessageHandler, source, destination, function (newTransport) {
          resolve(newTransport); //Set me to just return the correct transport.
        });
      } else {
        reject("unknown router transport name: " + transportName);
      }
    });
  }
}; //////////////////////////////////////////////////////////////
// Below all transports are defined then added to active list
//////////////////////////////////////////////////////////////

var RouterTransportImplementation = {}; // a convenience namespace for router-transport implementations

function getDefault(base, path, defaultValue) {
  var result = defaultValue;

  if (base) {
    try {
      var properties = path.split(".");
      var currentValue = base;

      for (var i = 1; i < properties.length; i++) {
        currentValue = currentValue[properties[i]];
      }

      result = currentValue;
    } catch (err) {
      result = defaultValue;
    }

    if (typeof result === "undefined") result = defaultValue;
  }

  return result;
}
/*
 * Implements the FinsembleTransport (alternative to IAB without iFrame problems with supporting server commonly running on local server).
 *
 * Required Functions (used by transport clients):
 * 		send(event) -- transports the event
 * 		identifier() -- returns transport name/identifier
 *
 * @param {object} params various parms to support transports
 * @param {any} parentMessageHandler callback for incoming event
 * @param {any} source either the client name or "RouterService"
 * @param {any} destination either the client name or "RouterService" (unused in FinsembleTransport)
 */
//


RouterTransportImplementation.FinsembleTransport = function (params, parentMessageHandler, source, destination, callback) {
  /** @TODO - split into two separate vars for clarity. */
  var serverAddress = getDefault(params, "params.transportSettings.FinsembleTransport.serverAddress", getDefault(params, "params.transportSettings.FinsembleTransport.serverAddress", "ws://127.0.0.1:3376"));
  var SOCKET_SERVER_ADDRESS = serverAddress + "/router"; // "router" is the socket namespace used on server

  var self = this; // receives incoming messages then passes on to parent (what's passed to parent should be same routerMessage received in send()

  function finsembleMessageHandler(routerMessage) {
    var incomingTransportInfo = {
      transportID: self.identifier(),
      client: routerMessage.clientMessage.header.origin
    };
    //console.log("FinsembleTransport Incoming Transport", incomingTransportInfo, "Message", routerMessage);
    parentMessageHandler(incomingTransportInfo, routerMessage.clientMessage);
  } //required function for the parent (i.e. routeClient or routeService)


  this.send = function (transport, routerMessage) {
    var dest;
    var message; // decide how to route the message based on whether client or routerservice is sending

    if (arguments.length === 1) {
      // clients use just one parameter, so send client message to RouterService
      dest = "ROUTER_SERVICE";
      routerMessage = arguments[0];
      message = {
        clientMessage: routerMessage
      }; // no client property needed to route on server since always going to router service
    } else {
      // router service uses both parameters, so send router-service mssage to a client
      dest = "ROUTER_CLIENT";
      routerMessage = arguments[1];
      message = {
        client: transport.client,
        clientMessage: routerMessage
      }; // client property used to router on server
    }

    //console.log("FinsembleTransport Outgoing Transport", dest, "NewMessage", message);
    routerServerSocket.send(JSON.stringify({
      dest: dest,
      message: message
    }));
  }; //required function for the parent (i.e. routeClient or routeService)


  this.identifier = function () {
    return "FinsembleTransport";
  };

  //console.log("FinsembleTransport Transport Initializing for " + source + " using " + SOCKET_SERVER_ADDRESS);

  function connectTimeoutHandler() {
    //console.log("FinsembleTransport Connection Timeout for " + source);
    callback(self);
  } // set up for receiving incoming messages


  var createSocketConn = function createSocketConn() {
    var tempSocket;

    if (SOCKET_SERVER_ADDRESS.startsWith("ws:") || SOCKET_SERVER_ADDRESS.startsWith("wss:")) {
      tempSocket = new WebSocket(SOCKET_SERVER_ADDRESS);
    } else {
      console.error("address ".concat(SOCKET_SERVER_ADDRESS, " is not a valid websocket protocol. Please use ws:// or wss://"));
    }

    var connectTimer = setTimeout(connectTimeoutHandler, 3000); // cleared in setServiceOnline

    tempSocket.addEventListener("open", function () {
      clearTimeout(connectTimer);
      //console.log("FinsembleTransport Connected to Server"); // TODO: Currently all messages are broadcast to everyone and filtering happens here. Need to implement a system similar to socket.io to prevent this or only send messages to proper destinations.

      tempSocket.addEventListener("message", function (event) {
        var data = JSON.parse(event.data);

        if (source === "RouterService" && data.dest == "ROUTER_SERVICE") {
          finsembleMessageHandler(data.message);
        } else if (source === data.message.client) {
          finsembleMessageHandler(data.message);
        }
      });
      callback(self);
    });

    tempSocket.onclose = function (e) {
      //console.log('Socket is closed. Reconnect will be attempted in 1 second.');
      setTimeout(function () {
        routerServerSocket = createSocketConn();
      }, 1000);
    };

    tempSocket.onerror = function (err) {
      console.error('Socket error, closing socket', err);
      tempSocket.close();
    };

    return tempSocket;
  };

  var routerServerSocket = createSocketConn();
}; // add the transports to the available/active list


RouterTransport.addTransport("FinsembleTransport", RouterTransportImplementation.FinsembleTransport);
exports["default"] = RouterTransport;

/***/ })

/******/ });
});
//# sourceMappingURL=fpe-router.map.js
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js")["Promise"]))

/***/ }),

/***/ "./node_modules/es6-promise/dist/es6-promise.js":
/*!******************************************************!*\
  !*** ./node_modules/es6-promise/dist/es6-promise.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	undefined;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));



//# sourceMappingURL=es6-promise.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js"), __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/finsemble-excel/commands/commands.ts":
/*!**************************************************!*\
  !*** ./src/finsemble-excel/commands/commands.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/* global global, Office, self, window */
var fpe_router_1 = __webpack_require__(/*! @chartiq/fpe-router */ "./node_modules/@chartiq/fpe-router/dist/fpe-router.js");
var finsembleRouter = fpe_router_1.default.router;
var LauncherClient = fpe_router_1.default.LauncherClient;
var launcherClient = new LauncherClient(finsembleRouter);
var fileName = '';
Office.onReady(function () {
    // If needed, Office.js is ready to be called
    Office.context.document.settings.set("finsemble-excel", true);
    Office.context.document.settings.set("Office.AutoShowTaskpaneWithDocument", true);
    //Office.addin.setStartupBehavior(Office.StartupBehavior.load)
    Office.context.document.settings.saveAsync();
    Office.context.document.getFilePropertiesAsync(function (asyncResult) {
        var fileUrl = asyncResult.value.url;
        fileName = fileUrl.replace(/^.*[\\\/]/, '');
    });
});
/**
 * Shows a notification when the add-in command is executed.
 * @param event
 */
var action = function (event) {
    var message = {
        type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
        message: "Performed action.",
        icon: "Icon.80x80",
        persistent: true
    };
    // Show a notification message
    Office.context.mailbox.item.notificationMessages.replaceAsync("action", message);
    // Be sure to indicate when the add-in command function is complete
    event.completed();
};
var spawn = function (event) {
    launcherClient.Spawn("Welcome Component");
    event.completed();
};
var broadcastData = function (event) {
    Excel.run(function (context) {
        var worksheet = context.workbook.worksheets.getActiveWorksheet();
        worksheet.load("items/name");
        var range = context.workbook.getSelectedRange();
        range.load("address, values");
        return context.sync().then(function () {
            finsembleRouter.transmit(fileName + "-event", {
                event: "SHEET_BROADCAST_VALUES",
                eventObj: {
                    worksheet: worksheet,
                    range: range.address.split("!")[1],
                    values: range.values,
                    params: { value: "test" }
                },
                fileName: fileName
            });
            event.completed();
        });
    }).catch(console.log);
};
var createBookmark = function (event) {
    Office.addin.showAsTaskpane().then(function () {
        finsembleRouter.transmit(fileName + "-event", { event: 'OPEN_CREATE_BOOKMARK_PANEL', fileName: fileName });
        event.completed();
    });
};
var getGlobal = function () {
    return typeof self !== "undefined"
        ? self
        : typeof window !== "undefined"
            ? window
            : typeof global !== "undefined"
                ? global
                : undefined;
};
var g = getGlobal();
// the add-in command functions need to be available in global scope
g.action = action;
g.spawn = spawn;
g.broadcastData = broadcastData;
g.createBookmark = createBookmark;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ })

/******/ });
//# sourceMappingURL=commands.js.map