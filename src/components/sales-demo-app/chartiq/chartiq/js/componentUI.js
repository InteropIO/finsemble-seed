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


import { CIQ } from "../js/chartiq.js";
var claims = [];
/**
 * The following is a set of web components used in our sample templates to illustrate how the API can be leveraged to build a full featured UI to control the chart.
 *
 * Feel free to use them as provided, or modify the web components to meet your needs. You can find all of the source code for these components in `js/components.js`
 * and `js/componentUI.js`.
 *
 * This implementation assumes the chart is attached to to a quote feed for interactive data loading. If you will not be using a quote feed, you will need to adjust
 * these components accordingly.
 *
 * >Two special tags are required to run the framework:
 * >
 * >`cq-ui-manager` is a component that manages all menus and dialogs on the page. It does so by attaching itself to the HTML body element, monitoring touch and mouse events,
 * and then instantiating menus and dialogs. For instance, when a user taps on the screen, they expect that any open menus will be closed. This is one of the responsibilities
 * that `cq-ui-manager` assumes.
 * > <br>**One cq-ui-manager tag is allowed for the entire page, even when multiple charts are instantiated.**
 * >
 * > `cq-context` is a special tag that groups a set of components to a particular chart. Any component that is nested within a `cq-context` will look to that context
 * in order to find its chart. For instance, menu items within a `cq-context` will interact with the chart engine that is attached to the context.
 *
 * **Performance considerations:** These web components include dynamically updating modules that will react to every data change and redraw certain elements.
 * Although visually pleasing, they can sometimes cause performance issues on slow devices or when multiple charts are displayed.
 * See {@link CIQ.UI.animatePrice} for setting options.
 *
 * See {@link CIQ.UI.ContextTag}, which provides a model and base functionality for many components
 *
 * See the following tutorial for further details on how to work with and customize the included web components: {@tutorial Web Component Interface}.
 *
 * @namespace WebComponents
 */
function WebComponents() {}
/**
 * Namespace for UI helper objects designed to be used with the library
 * [web components]{@link WebComponents}.
 *
 * @namespace
 * @name CIQ.UI
 */
if (!CIQ.UI) CIQ.UI = {};
/**
 * Attaches an event listener to the supplied element.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}.
 * A full tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {HTMLElement} element The DOM element to which the listener is attached.
 * @param {function} listener The listener function to attach to the DOM element.
 * @param {string} [selector] A CSS selector to apply to `element` to obtain the descendant
 * 		element to which the listener is attached.
 *
 * @memberof CIQ.UI
 * @since 8.1.0
 */
CIQ.UI.stxtap = function (element, listener, selector) {
	if (!element) return;
	CIQ.installTapEvent(element);
	if (typeof selector == "string") {
		element = element.querySelector(selector);
	}
	if (element) element.addEventListener("stxtap", listener);
};
/**
 * Attaches a callback to listen for resize events on the DOM.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}.
 * A full tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {node} element The node to which the listener is attached.
 * @param {function} fn The listener function to attach to the DOM element.
 *
 * @memberof CIQ.UI
 * @since 7.4.0 Replaces {@link CIQ.addResizeListener}.
 */
CIQ.UI.addResizeListener = function (element, fn) {
	CIQ.UI.getUIManager().registerForResize(element);
	element.resizeHandle = CIQ.resizeObserver(element, fn, null, 250);
};
/**
 * Removes an attached resize event listener from a DOM element.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}.
 * A full tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {node} element The node from which the listener is removed.
 *
 * @memberof CIQ.UI
 * @since 7.4.0 Replaces {@link CIQ.removeResizeListener}.
 */
CIQ.UI.removeResizeListener = function (element) {
	CIQ.UI.getUIManager().unregisterForResize(element);
	CIQ.resizeObserver(element, null, element.resizeHandle);
};
/**
 * Executes a function in the nearest parent component (container). For instance, a `cq-close`
 * component might call "close" on its containing component.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {object} self A reference to a web component. The function is called on a parent of
 * 		the component.
 * @param {string} fn The name of the function to execute.
 * @param {array} args Arguments array (a "spread" is also supported).
 *
 * @memberof CIQ.UI
 */
CIQ.UI.containerExecute = function (self, fn, args) {
	var myArgs = args;
	if (args && myArgs.constructor !== Array)
		myArgs = Array.prototype.slice.call(arguments, 2);
	var parent = self.parentElement;
	while (parent) {
		if (parent[fn] && parent[fn].constructor == Function) {
			return parent[fn].apply(parent, myArgs);
		}
		parent = parent.parentElement;
	}
	return null;
};
/**
 * Convenience function to display the changing price of a node (price flash green/red).
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * This functionality, especially with the fade effect, can be CPU expensive if many updates
 * per second or multiple charts on a screen exist. To disable simply set
 * `CIQ.UI.animatePrice = function () { };`.
 *
 * @param {node} node The HTML element on which to apply the changing price effect.
 * @param {number} newPrice The new price; can be higher or lower than the previous price.
 * @param {number} oldPrice The previous price.
 * @param {boolean} fade If `true`, animate the price with a fade transition effect;
 * 		otherwise, do not use a transition effect.
 *
 * @memberof CIQ.UI
 * @since 7.2.0 Added the `fade` argument.
 */
CIQ.UI.animatePrice = function (node, newPrice, oldPrice, fade) {
	if (node[0]) node = node[0];
	if (node.timeoutHandle) {
		clearTimeout(node.timeoutHandle);
		node.timeoutHandle = null;
	}
	node.classList.remove("cq-stable", "cq-up", "cq-down");
	if (newPrice > oldPrice) node.classList.add("cq-up");
	else if (newPrice < oldPrice) node.classList.add("cq-down");
	if (fade)
		node.timeoutHandle = setTimeout(function () {
			node.classList.add("cq-stable").classList.remove("cq-up", "cq-down");
		}, 0);
};
/**
 * Convenience function for making a new node collection from an HTML5 template.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {string|HTMLElement|object} node The template from which the node collection is created, can be a jQuery object.
 * @param {HTMLElement|boolean} [appendTo] If set to an element, then the template is
 * 		automatically appended to the element. If set to true, then the new node collection is
 * 		automatically added in place (appended to the template's parent). A falsey value prevents
 * 		the contents of the template from being added to the DOM.
 * @return {object} The node collection extracted from the template as a jQuery, if available, or Faquery object.
 *
 * @memberof CIQ.UI
 * @since 8.1.0 Input parameters continue to support jQuery elements. If `node` is a jQuery
 * 		element, then the return type is also a jQuery element.
 */
CIQ.UI.makeFromTemplate = function (node, appendTo) {
	if (typeof node === "string") node = document.querySelector(node);
	if (node[0] && CIQ.UI.$(node)[0] == node[0]) {
		node = node[0];
	}
	var n = node.content; // regular way
	var newNode;
	function copyNodes(n) {
		return function (i) {
			n.appendChild(i.cloneNode(true));
		};
	}
	function appendNodes(n) {
		return function (i) {
			if (n === true) node.parentElement.appendChild(i);
			else if (n[0]) n[0].appendChild(i);
			else n.appendChild(i);
		};
	}
	if (!n.childNodes.length) {
		// React can't read content past the document-fragment
		n = document.createElement("DIV");
		Array.from(node.children).forEach(copyNodes(n));
		newNode = n.cloneNode(true);
	} else {
		newNode = document.importNode(n, true);
	}
	var children = Array.from(newNode.children);
	if (appendTo) children.forEach(appendNodes(appendTo));
	return CIQ.UI.$(children);
};
/**
 * Utility to splits a string form function into function name and arguments
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param  {String} cmd The string function call.
 * @return {Object|null} Null or object containing `helperName`, `functionName` and `args`.
 *
 * @memberof CIQ.UI
 * @private
 */
CIQ.UI.splitMethod = function (cmd) {
	if (!cmd) return null;
	var openParentheses = cmd.indexOf("(");
	var closeParentheses = cmd.lastIndexOf(")");
	if (openParentheses == -1 || closeParentheses == -1) {
		console.log("malformed stxtap attribute: " + cmd);
		return null;
	}
	var helperName = null,
		functionName;
	var beforeParentheses = cmd.substring(0, openParentheses);
	var period = beforeParentheses.indexOf(".");
	if (period == -1) {
		// web component
		functionName = beforeParentheses;
	} else {
		helperName = beforeParentheses.substring(0, period);
		functionName = cmd.substring(period + 1, openParentheses);
	}
	var args = cmd.substring(openParentheses + 1, closeParentheses);
	var parsed = args.match(/('[^']+'|[^,]+)/g);
	var isFloat = new RegExp("^[0-9]+([,.][0-9]+)?$", "g");
	var isInteger = new RegExp("^\\d+$");
	var argArray = [];
	if (parsed) {
		for (var i = 0; i < parsed.length; i++) {
			var arg = parsed[i];
			while (arg.charAt(0) == " ") arg = arg.substring(1);
			if (arg.indexOf('"') != -1 || arg.indexOf("'") != -1) {
				argArray.push(arg.substring(1, arg.length - 1));
			} else if (arg == "true") {
				argArray.push(true);
			} else if (arg == "false") {
				argArray.push(false);
			} else if (arg == "null") {
				argArray.push(null);
			} else if (isInteger.test(arg)) {
				argArray.push(parseInt(arg, 10));
			} else if (isFloat.test(arg)) {
				argArray.push(parseFloat(arg));
			} else {
				var a = arg.split(".");
				var aObj = window;
				for (var b = 0; b < a.length; b++) {
					aObj = aObj[a[b]];
				}
				argArray.push(aObj);
			}
		}
	}
	return {
		helperName: helperName,
		functionName: functionName,
		args: argArray
	};
};
/**
 * Observes an object's property. The listener receives an object of the form:
 * `{obj, property, value}`. This uses getters and setters. Thus, you should not attempt to
 * observe a property which already has a getter or setter.
 *
 * **Note:** The listener is only executed when the property is assigned a different value
 * than it already has.
 *
 * @param {String} property Name of the observed property.
 * @param {Object} obj Object that contains the property.
 * @param {function} listener Function to execute when the property changes.
 *
 * @memberof CIQ.UI
 * @since 7.2.0 Replaces {@link CIQ.UI.observe}.
 *
 * @example
 * var stx=this.context.stx, className=this.params.activeClassName;
 * var listener=function(obj){
 *		if(obj.value) node.classList.add(className);
 *		else node.classList.remove(className);
 * };
 * CIQ.UI.observeProperty("flipped", stx.layout, listener);
 */
CIQ.UI.observeProperty = function (property, obj, listener) {
	if (!obj || !property || !listener) return; // must have a listener
	if (!(property in obj)) obj[property] = undefined;
	if (!CIQ.UI.observables) CIQ.UI.observables = {};
	var observables = CIQ.UI.observables;
	if (!observables[property]) observables[property] = [];
	var found; // this will become the observed object
	for (var obsIter = 0; obsIter < observables[property].length; obsIter++) {
		var ap = observables[property][obsIter];
		if (ap.obj == obj) found = ap;
	}
	if (!found) {
		found = {
			obj: obj,
			value: obj[property],
			listeners: []
		};
		observables[property].push(found);
	}
	found.listeners.push(listener);
	listener({ obj: obj, property: property, value: found.value });
	Object.defineProperty(obj, property, {
		enumerable: true,
		get: function () {
			return found.value;
		},
		set: function (value) {
			if (found.value !== value) {
				found.value = value;
				var params = { obj: obj, property: property, value: value };
				for (var l = 0; l < found.listeners.length; l++)
					found.listeners[l](params);
			}
		}
	});
};
/**
 * Removes the listener from an object's property.
 *
 * @param {String} property Name of the property from which the listener is removed.
 * @param {Object} obj Object that contains the property.
 * @param {function} [listener] Optional listener to remove; otherwise, the entire object will
 * 		be removed and made unobservable.
 *
 * @memberof CIQ.UI
 * @since 7.2.0 Replaces {@link CIQ.UI.unobserve}.
 */
CIQ.UI.unobserveProperty = function (property, obj, listener) {
	if (!property || !obj || !CIQ.UI.observables) return;
	var observables = CIQ.UI.observables[property];
	if (observables) {
		for (var obs = observables.length - 1; obs >= 0; obs--) {
			var observable = observables[obs];
			if (observable.obj == obj) {
				if (listener) {
					var listenerArr = observable.listeners;
					for (var l = listenerArr.length; l >= 0; l--) {
						if (listenerArr[l] === listener) listenerArr.splice(l, 1);
					}
				}
				if (!listener || !observable.listeners.length) {
					// reset property and make unobservable
					Object.defineProperty(obj, property, {
						enumerable: true,
						configurable: true,
						writable: true,
						value: observable.value
					});
					observables.splice(obs, 1);
				}
			}
		}
		if (!observables.length) delete CIQ.UI.observables[property];
	}
};
/**
 * Utility to get the context for a tag.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * It traverses up the parent stack looking for a parent with a context member, or the actual
 * `cq-context`. If no context can be found then returns null.
 *
 * @param {HTMLElement} me The element for which to get the context.
 * @return {CIQ.UI.Context} The context or null if none found.
 *
 * @memberof CIQ.UI
 */
CIQ.UI.getMyContext = function (me) {
	while (me) {
		if (me.context) return me.context;
		if (me.CIQ && me.CIQ.UI) return me.CIQ.UI.context;
		me = me.parentElement;
	}
	return null;
};
/**
 * Utility to run a function across all contexts.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * The value of `this` is set to the context.
 *
 * @param {Function} func Function to run.
 *
 * @memberof CIQ.UI
 *
 * @example
 *  CIQ.UI.contextsForEach(function(){
 *  	this.stx.doSomething();
 *  });
 */
CIQ.UI.contextsForEach = function (func) {
	var contexts = document.querySelectorAll("cq-context,*[cq-context]");
	contexts.forEach(function (node) {
		func.apply(node.CIQ.UI.context);
	});
};
CIQ.UI.release = false;
/**
 * Set this flag to true to bypass bindings when adding a component to the DOM.
 *
 * Designed to be used with the included {@link WebComponents}. A full tutorial on how to work
 * with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * For instance, when components are created by html2canvas, we don't want them to do any
 * heavy lifting.
 *
 * @type {Boolean}
 *
 * @memberof CIQ.UI
 */
CIQ.UI.bypassBindings = false;
/**
 * Starts the UI.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {Function} [cb] Optional callback returns when web components are initialized.
 *
 * @memberof CIQ.UI
 */
CIQ.UI.begin = function (cb) {
	CIQ.UI.release = true;
	setTimeout(function () {
		BaseComponent.nextTick();
		if (cb) cb();
	}, 0); // release the bindings
};
/**
 * Activates the user interface of a plug-in or add-on.
 *
 * To ensure the graceful loading of plug-ins and add-ons, UI components are not displayed until
 * the plug-in or add-on class has loaded.
 *
 * This function adds a custom boolean attribute (see
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes) to the top
 * DOM node of the chart UI context to indicate that a plug-in or add-on is active. The attribute
 * is the concatenation of `pluginName` (all lowercase) and "-active"; for example,
 * "tableview-active".
 *
 * CSS rule-sets use the attribute in compound selectors to display the relevant UI components,
 * for example:
 * ```
 * body *[tableview-active] .tableview-ui {
 *     display: inherit;
 * }
 * ```
 *
 * See the *chartiq.css* file in the *css* folder of the library.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine.
 * @param {string} pluginName The case-insensitive name of the plug-in or add-on to activate; for
 * 		example, "scriptiq" for the ScriptIQ plug-in or "TableView" for the TableView add-on.
 *
 * @memberof CIQ.UI
 * @private
 * @since 8.2.0
 */
CIQ.UI.activatePluginUI = function (stx, pluginName) {
	const { uiContext = {}, container } = stx;
	const topNode = uiContext.topNode || container.closest("cq-context");
	if (topNode) topNode.setAttribute(pluginName.toLowerCase() + "-active", "");
};
/**
 * Adds a web component definition to the list of web components.
 *
 * The component is ultimately registered as a custom element by
 * {@link CIQ.UI.registerComponents}.
 *
 * Separating registration of the component from addition of the component to the component
 * list provides the ability to customize the web component via class extension. Customized
 * classes can be re-added using the original tag name.
 *
 * @param {String} [customTagName] Tag name that identifies the web component class; for
 * 		example, cq-abstract-marker.
 * @param {function} [classDefinition] The class definition of the component; for example, the
 * 		definition of the {@link AbstractMarker} class.
 *
 * @memberof CIQ.UI
 * @since 7.5.0
 */
CIQ.UI.addComponentDefinition = function (customTagName, classDefinition) {
	const registered = !!CIQ.UI.registerComponentsImmediately;
	if (!CIQ.UI._webcomponents) {
		CIQ.UI._webcomponents = { list: {}, registered };
	}
	CIQ.UI._webcomponents.list[customTagName] = {
		tag: customTagName,
		classDefinition,
		registered
	};
	if (registered) {
		customElements.define(customTagName, classDefinition);
	}
};
/**
 * Registers components added with {@link CIQ.UI.addComponentDefinition}.
 *
 * @param {object} config Configuration
 * @param {String[]} [config.except=[]] A list of tags that should not be registered, reserving the
 * 		tag names for an alternative use.
 *
 * @memberof CIQ.UI
 * @since 7.5.0
 */
CIQ.UI.registerComponents = function ({ except = [] } = {}) {
	if (!CIQ.UI._webcomponents) return;
	const { exceptions = {} } = CIQ.UI._webcomponents;
	except.forEach((name) => (exceptions[name] = true));
	CIQ.UI._webcomponents.exceptions = exceptions;
	const { list } = CIQ.UI._webcomponents;
	const tags = Object.keys(list).filter((tag) => !except.includes[tag]);
	tags.forEach((tag) => {
		const component = list[tag];
		if (component && !component.registered && !exceptions[tag]) {
			customElements.define(tag, component.classDefinition);
			component.registered = true;
		}
	});
};
/**
 * Ensures that all web components in the web component list (see
 * [addComponentDefinition]{@link CIQ.UI.addComponentDefinition}) have been registered.
 *
 * @memberof CIQ.UI
 * @since 7.5.0
 *
 * @see {@link CIQ.UI.registerComponents}
 */
CIQ.UI.ensureComponentsRegistered = function () {
	if (CIQ.UI._webcomponents) CIQ.UI.registerComponents();
};
/**
 * Gets an array of components from the list of registered components.
 *
 * @param {string|function} identifier Tag, class name, or class definition used to identify
 * 		registered components.
 * @return {array} An array of components identified by `identifier`. The array elements
 * 		contain the tag, name, registration status, and markup of the matched components.
 * 		If an identifier is not provided, data for all registered components is returned.
 *
 * @memberof CIQ.UI
 * @since 8.0.0
 */
CIQ.UI.components = function (identifier) {
	const collection = Object.values(CIQ.UI._webcomponents.list).filter(
		({ tag, classDefinition }) => {
			return (
				!identifier ||
				identifier === tag ||
				identifier === classDefinition.name ||
				identifier === classDefinition
			);
		}
	);
	return collection;
};
/**
 * Getter and setter for component markup.
 *
 * @param {String|Function} identifier Tag, class name, or class definition that identifies a
 * 		component.
 * @param {String} markup If provided, sets the markup for the identified component.
 * @return {Object|undefined} An object containing the tag, name, registration status, and
 * 		markup of the identified component. If an identifier is not provided, returns data for
 *		all registered components. If an identifier is provided, but a registered component
 *		cannot be found, returns undefined.
 *
 * @memberof CIQ.UI
 * @since 7.5.0
 */
CIQ.UI.componentMarkup = function (identifier, markup) {
	const collection = this.components(identifier);
	if (markup === undefined) {
		// return results
		if (!collection.length) return;
		const selected = collection.map(toMarkupObject);
		return identifier ? selected[0] : selected;
	}
	const [component] = collection;
	// if component does not exist or its definition already does not have markup
	if (!component || !component.classDefinition.markup) return;
	component.classDefinition.markup = markup;
	return toMarkupObject(component);
	function toMarkupObject(component) {
		const {
			tag,
			registered,
			classDefinition: { markup, name }
		} = component;
		return { tag, name, registered, markup };
	}
};
/**
 * Returns the dependencies of all web components based on the web component markup.
 *
 * Any web component that has markup that relies on another web component is listed in the
 * returned object along with an array of the component's dependencies.
 *
 * **Note:** Call this function after all web components have been loaded, otherwise the
 * results will not accurately reflect the dependencies.
 *
 * @return {object} An object with the following properties:
 * - `dependencies` &mdash; An object whose properties are the names of web components that
 *    have dependencies. The value of each property is an array of the dependencies.
 * - `timesNeeded` &mdash; An object whose properties are the names of the web components that
 *    are dependencies for other web components. The value of each property is the number of
 *    times the component is needed as a dependency.
 *
 * For example:
 *
 * ```js
 * {
 *     dependencies: {
 *         cq-aggregation-dialog: ["cq-close"],
 *         cq-chartcontrol-group: ["cq-clickable", "cq-lookup", "cq-menu", "cq-menu-container", "cq-toggle", "cq-menu-dropdown"],
 *         cq-chart-legend: ["cq-comparison", "cq-study-legend", "cq-swatch"],
 *         cq-comparison-lookup: ["cq-comparison", "cq-lookup", "cq-menu", "cq-swatch"],
 *         cq-drawing-context: ["cq-menu", "cq-menu-dropdown"],
 *         cq-fib-settings-dialog: ["cq-scroll"],
 *         cq-info-toggle: ["cq-toggle"],
 *         cq-language-dialog: ["cq-close"],
 *         cq-lookup: ["cq-scroll"],
 *         cq-share-dialog: ["cq-close"],
 *         cq-study-dialog: ["cq-menu", "cq-scroll", "cq-study-input", "cq-study-output", "cq-study-parameter", "cq-swatch",
 *                           "cq-menu-dropdown"],
 *         cq-theme-dialog: ["cq-close", "cq-scroll", "cq-swatch", "cq-theme-piece"],
 *         cq-themes: ["cq-close"],
 *         cq-timezone-dialog: ["cq-close"],
 *         cq-views: ["cq-heading"],
 *         cq-drawing-palette: ["cq-menu", "cq-redo", "cq-scroll", "cq-toggle", "cq-undo", "cq-menu-dropdown"],
 *         cq-drawing-settings: ["cq-clickable", "cq-cvp-controller", "cq-menu", "cq-wave-parameters", "cq-menu-dropdown"]
 *     },
 *     timesNeeded: {
 *         cq-close: 6,
 *         cq-clickable: 2,
 *         cq-lookup: 2,
 *         cq-menu: 6,
 *         cq-menu-container: 1,
 *         cq-toggle: 3,
 *         cq-menu-dropdown: 5,
 *         cq-comparison: 2,
 *         cq-study-legend: 1,
 *         cq-swatch: 4,
 *         cq-scroll: 5,
 *         cq-study-input: 1,
 *         cq-study-output: 1,
 *         cq-study-parameter: 1,
 *         cq-theme-piece: 1,
 *         cq-heading: 1,
 *         cq-redo: 1,
 *         cq-undo: 1,
 *         cq-cvp-controller: 1,
 *         cq-wave-parameters: 1
 *     }
 * }
 *```
 *
 * @memberof CIQ.UI
 * @since 8.0.0
 */
CIQ.UI.markupDependencies = function () {
	const markups = CIQ.UI.componentMarkup();
	const dependencies = {};
	markups.forEach((m) => {
		if (m.markup) {
			for (let c in CIQ.UI._webcomponents.list) {
				const comp = CIQ.UI._webcomponents.list[c];
				if (m.markup.indexOf("</" + comp.tag + ">") > -1) {
					if (!dependencies[m.tag]) dependencies[m.tag] = [];
					dependencies[m.tag].push(comp.tag);
				}
			}
		}
	});
	const timesNeeded = {};
	for (let d in dependencies) {
		dependencies[d].forEach((i) => {
			timesNeeded[i] = (timesNeeded[i] || 0) + 1;
		});
	}
	return { dependencies, timesNeeded };
};
/**
 * Utility method for adding multiple inheritances to a base object.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {Object} target Target object.
 * @param {Object} source Source object.
 *
 * @memberof CIQ.UI
 */
CIQ.UI.addInheritance = function (target, source) {
	// We put this in a catch loop because BaseComponent is itself an HTMLElement and the browser barfs on trying to copy some of those values
	for (var key in source.prototype) {
		try {
			target.prototype[key] = source.prototype[key];
		} catch (e) {}
	}
};
var inputTypesSupported = {};
/**
 * Utility method for checking if an HTML5 input type is supported.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * Returns the type passed in if it's supported or a fallback type if it is not.
 *
 * @param {String} type HTML5 input type to be tested.
 * @return {String} The supported input type, or the fallback input type (usually "text").
 *
 * @memberof CIQ.UI
 * @since 6.3.0
 */
CIQ.UI.supportedInputType = function (type) {
	if (!inputTypesSupported[type]) {
		// https://stackoverflow.com/questions/10193294/how-can-i-tell-if-a-browser-supports-input-type-date
		var input = document.createElement("input");
		input.setAttribute("type", type);
		inputTypesSupported[type] = input.type;
	}
	return inputTypesSupported[type];
};
/**
 * UI context helper class.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @param {CIQ.ChartEngine} stx The chart object to associate with this UI context.
 * @param {HTMLElement} topNode The top node of the DOM tree for this context. The top node should
 * 		contain all of the UI elements associated with the chart engine.
 * @param {object} [params] Context parameters.
 *
 * @name CIQ.UI.Context
 * @constructor
 */
CIQ.UI.Context = function (stx, topNode, params) {
	this.params = params ? params : {};
	this.stx = stx;
	if (stx) {
		stx.uiContext = this;
	}
	this.node = CIQ.UI.$(topNode);
	this.topNode = this.node[0];
	if (CIQ.isMobile) topNode.setAttribute("ciq-mobile", "");
	var storage = CIQ.UI.Context.assembleContext(topNode);
	this.advertised = {};
	var self = (topNode.CIQ.UI.context = this);
	// Search through all of the components that have registered themselves. Call setContext() on each
	// so that they can get their context. This usually initializes and makes the component active.
	var selectors = [];
	for (var i = 0; i < storage.Components.length; i++) {
		selectors.push(storage.Components[i].tagName.toLowerCase());
	}
	// Make sure to call setContextPrivate on elements in the order they appear in the DOM, not the order
	// they are initialized in (which may be different for example if using a plugin)
	if (selectors.length) {
		this.topNode
			.querySelectorAll(selectors.join(","))
			.forEach(function (component) {
				component.setContextPrivate(self);
			});
	}
};
var Context = CIQ.UI.Context;
/**
 * The DOM tag for a context that needs some storage.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * ContextTag components register themselves by placing themselves in this storage.
 * This method creates that storage, if it hasn't already been created.
 *
 * @param  {HTMLElement} contextElement The context node.
 * @returns {Object} The storage object.
 *
 * @memberof CIQ.UI.Context
 * @private
 */
Context.assembleContext = function (contextElement) {
	if (!contextElement.CIQ) contextElement.CIQ = {}; // claim our namespace
	if (!contextElement.CIQ.UI) contextElement.CIQ.UI = {};
	if (!contextElement.CIQ.UI.Components) contextElement.CIQ.UI.Components = [];
	return contextElement.CIQ.UI;
};
/**
 * Executes a symbol change request on the UI context.
 *
 * You must create an implementation of this abstract method (see example below).
 *
 * @param {object} data A symbol data object acceptable by {@link CIQ.ChartEngine#loadChart}.
 * @param {string} data.symbol A financial instrument symbol.
 * @param {function} [cb] A callback function to execute when the symbol change is complete.
 *
 * @abstract
 * @memberof CIQ.UI.Context.prototype
 * @alias changeSymbol
 * @since 8.2.0 Added the `cb` parameter.
 *
 * @example <caption>Method Implementation</caption>
 * uiContext.changeSymbol = function (data, cb) {
 *     const { stx, loader } = uiContext;
 *     if (loader) loader.show();
 *
 *     if (data.symbol == data.symbol.toLowerCase())
 *         data.symbol = data.symbol.toUpperCase(); // Set a pretty display version.
 *
 *     // Reset comparisons -- remove this loop to transfer from symbol to symbol.
 *     for (let field in stx.chart.series) {
 *         // Keep studies.
 *         if (stxx.chart.series[field].parameters.bucket != "study" ) stx.removeSeries(field);
 *     }
 *
 *     stx.loadChart(data, function(err) {
 *         if (err) {
 *             // Add 'symbol not found error' here if one needed.
 *             if (loader) loader.hide();
 *             return;
 *         }
 *         if (loader) loader.hide();
 *         CIQ.ChartEngine.restoreDrawings(stx, stx.chart.symbol);
 *     });
 *
 *     if (cb) cb(stx);
 * };
 *
 */
Context.prototype.changeSymbol = function (data, cb) {
	console.log("Please implement CIQ.UI.Context.prototype.changeSymbol");
};
/**
 * Lookup driver interface placeholder to be augmented in standard.js with properties
 * @tsinterface {object} CIQ.ChartEngine.Driver~Lookup
 */
/**
 * Sets the [lookup driver]{@link CIQ.ChartEngine.Driver.Lookup} used by the
 * [cq-lookup]{@link WebComponents.cq-lookup} web component.
 *
 * The lookup driver searches for matching symbols as text is entered in the
 * [cq-lookup]{@link WebComponents.cq-lookup} web component's input field.
 *
 * @param {CIQ.ChartEngine.Driver.Lookup} driver Lookup driver for the
 * 		[cq-lookup]{@link WebComponents.cq-lookup} web component.
 *
 * @memberof CIQ.UI.Context.prototype
 * @alias setLookupDriver
 *
 * @example
 * // Create a context object.
 * UIContext = new CIQ.UI.Context(stxx, document.querySelector("cq-context,[cq-context]"));
 *
 * // Add a lookup driver to the context. The cq-lookup web component accesses the driver from the context.
 * UIContext.setLookupDriver(new CIQ.ChartEngine.Driver.Lookup.ChartIQ());
 *
 * // Get a reference to the cq-lookup web component.
 * UIContext.UISymbolLookup = document.querySelector(".ciq-search cq-lookup");
 *
 * // Set a callback on the cq-lookup web component.
 * UIContext.UISymbolLookup.setCallback(function(context, data) {
 *     context.changeSymbol(data);
 * });
 */
Context.prototype.setLookupDriver = function (driver) {
	this.lookupDriver = driver;
	if (driver.deprecated)
		console.warn(
			"Using deprecated Lookup Driver, please see documentation: CIQ.ChartEngine.Driver.Lookup"
		);
};
/**
 * Attaches a Helper to the context, so that it can be found later on.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @param {CIQ.UI.Helper} uiHelper A UI Helper to attach
 * @param {String} helperName The helperName of the element. For instance "Loader"
 * @memberof CIQ.UI.Context
 * @alias advertiseAs
 */
Context.prototype.advertiseAs = function (uiHelper, helperName) {
	this.advertised[helperName] = uiHelper;
};
/**
 * Finds the nearest (parent) node that contains the class (CIQ.UI.Element type) referenced by an stxtap attribute.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * Returns `null` if none found.
 * @param  {String} helperName The type of UI Helper to look for
 * @return {CIQ.UI.Helper|undefined} The associated helper
 * @memberof CIQ.UI.Context
 * @private
 */
Context.prototype.getAdvertised = function (helperName) {
	return this.advertised[helperName];
};
/**
 * Web component instance to show loading status and having show and hide methods
 * @typedef {object} CIQ.UI~Loader
 * @property {function} show
 * @property {function} hide
 */
/**
 * Attaches a loader to a UI context.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @param {CIQ.UI.Loader} loader Loader instance
 * @memberof CIQ.UI.Context
 * @alias setLoader
 */
Context.prototype.setLoader = function (loader) {
	this.loader = loader;
};
/**
 * Checks if the context in modal mode.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @return {Boolean} true if in modal mode
 * @memberof CIQ.UI.Context
 * @alias isModal
 */
Context.prototype.isModal = function () {
	return this.stx.openDialog !== "";
};
/**
 * Checks the chart for a study legend that is active and has keyboard navigation control.
 *
 * @return {boolean} true if a [cq-study-legend]{@link WebComponents.cq-study-legend} component is
 * 		both active and has keyboard navigation control; otherwise, false.
 *
 * @memberof CIQ.UI.Context#
 * @alias isLegendKeyboardActive
 * @since 8.3.0
 */
Context.prototype.isLegendKeyboardActive = function () {
	const legends = document.querySelectorAll("cq-study-legend");
	if (legends.length) {
		for (let i = 0; i < legends.length; i++) {
			// Verify the legend is active and has keyboard control
			if (
				legends[i].classList.contains("ciq-active") &&
				legends[i].keyboardNavigation
			)
				return true;
		}
	}
	return false;
};
/**
 * Abstract class for {@link WebComponents} using this framework.
 *
 * Provides a base set of functionality for web components.
 *
 * @name CIQ.UI.BaseComponent
 * @class
 * @extends HTMLElement
 *
 * @see {@link WebComponents}
 */
class BaseComponent extends HTMLElement {
	constructor() {
		super();
		this.node = CIQ.UI.$(this);
		this.eventListeners = [];
	}
	/**
	 * Called automatically when a tag is instantiated.
	 *
	 * @alias connectedCallback
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @private
	 */
	connectedCallback() {
		if (this.attached) return;
		// "this" will be the instance of the tag that extends BaseComponent.
		BaseComponent.buildReverseBindings(this);
		this.attached = true;
	}
	/**
	 * Called automatically when a tag is removed from the DOM.
	 *
	 * @alias disconnectedCallback
	 * @memberOf CIQ.UI.BaseComponent.prototype
	 * @private
	 */
	disconnectedCallback() {
		this.attached = false;
		if (this.context) {
			for (var i = 0; i < this.eventListeners.length; i++) {
				this.context.stx.removeEventListener(this.eventListeners[i]);
			}
		}
	}
	/**
	 * Adds default markup to a web component if the component does not have any child nodes.
	 *
	 * @param {HTMLElement} component The component to which the markup is added.
	 * @param {String} [markup] The markup to add to the web component. Unused if the
	 * 		component has a static markup property that specifies the markup; for example,
	 * 		MyComponent.markup.
	 *
	 * @alias addDefaultMarkup
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	addDefaultMarkup(component, markup) {
		const node = component || this;
		const isEmpty = (node) => node.children.length === 0;
		if (isEmpty(node) && (node.constructor.markup || markup)) {
			const startTime = +new Date();
			node.innerHTML = markup || node.constructor.markup;
			BaseComponent.buildReverseBindings(node);
			if (CIQ.debug) {
				const timeToBuild = +new Date() - startTime;
				BaseComponent.createMarkupTime =
					timeToBuild + (BaseComponent.createMarkupTime || 0);
				console.log(
					"Building markup " +
						this.constructor.name +
						" " +
						(this.getAttribute("cq-name") || "") +
						" built in=" +
						timeToBuild,
					"total=" + BaseComponent.createMarkupTime
				);
			}
			if (CIQ.I18N && CIQ.I18N.localized) CIQ.I18N.translateUI(null, node);
		}
	}
	/**
	 * Writes in the chart engine communication channel.
	 *
	 * @param {String} path The channel path.
	 * @param {*} value The value written to the channel.
	 * @param {CIQ.ChartEngine} stx A reference to the chart engine.
	 *
	 * @alias channelWrite
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	channelWrite(path, value, stx) {
		const { obj, prop } = CIQ.UI.BaseComponent.getChannel(path, stx, this);
		if (!obj) {
			return;
		}
		obj[prop] = value;
	}
	/**
	 * Merges an object in the chart engine communication channel.
	 *
	 * @param {String} path The channel path.
	 * @param {Object} value The value merged to the channel.
	 * @param {CIQ.ChartEngine} stx A reference to the chart engine.
	 *
	 * @alias channelMergeObject
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	channelMergeObject(path, value, stx) {
		const { obj, prop } = CIQ.UI.BaseComponent.getChannel(path, stx, this);
		if (!obj) {
			return;
		}
		obj[prop] = Object.assign({}, obj[prop], value);
	}
	/**
	 * Reads the current value in the chart engine communication channel.
	 *
	 * @param {String} path The channel path.
	 * @param {CIQ.ChartEngine} [stx] Unused.
	 * @return {*} The current value in channel.
	 *
	 * @alias channelRead
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	channelRead(path, stx) {
		const { obj, prop } = CIQ.UI.BaseComponent.getChannel(path, stx, this);
		if (!obj) {
			return;
		}
		return obj && obj[prop];
	}
	/**
	 * Subscribes to the chart engine messaging channel.
	 *
	 * @param {*} path The channel path.
	 * @param {*} cb A callback invoked upon subscribing and whenever a new message is posted
	 * 		in the channel.
	 * @param {CIQ.ChartEngine} stx A reference to the chart engine.
	 * @return {function} A callback invoked when unsubscribing from the channel.
	 *
	 * @alias channelSubscribe
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	channelSubscribe(path, cb, stx) {
		const { obj, prop } = CIQ.UI.BaseComponent.getChannel(path, stx, this);
		if (!obj) {
			return;
		}
		function wrapper({ value }) {
			cb(value);
		}
		CIQ.UI.observeProperty(prop, obj, wrapper);
		return () => {
			CIQ.UI.unobserveProperty(prop, obj, wrapper);
		};
	}
	// DOM manipulation adapters
	/**
	 * Adapts the
	 * [querySelector]{@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector}
	 * method.
	 *
	 * @param {String} path The CSS selectors for which to search.
	 * @param {HTMLElement|String} context The chart context element, which is the starting
	 * 		point of the DOM query, or "thisChart" to indicate the chart context in which this
	 * 		function is called.
	 * @return {HTMLElement|undefined} The selected DOM element or undefined if an element is
	 * 		not found.
	 *
	 * @alias qs
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	qs(path, context) {
		if (context === "thisChart") {
			context = this.getContextContainer();
		}
		return (context || document).querySelector(path);
	}
	/**
	 * Adapts the
	 * [querySelectorAll]{@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll}
	 * method. Returns an array instead of a node list to enable chaining of the array `map`,
	 * `filter`, `forEach`, and `reduce` functions.
	 *
	 * @param {String} path The CSS selectors for which to search.
	 * @param {HTMLElement|String} context The chart context element, which is the starting
	 * 		point of the DOM query, or "thisChart" to indicate the chart context in whidh this
	 * 		function is called.
	 * @return {HTMLElement|undefined} An array of selected DOM element or undefined if no
	 * elements are found.
	 *
	 * @alias qsa
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	qsa(path, context) {
		if (context === "thisChart") {
			context = this.getContextContainer();
		}
		return Array.prototype.slice.call(
			(context || document).querySelectorAll(path) || []
		);
	}
	/**
	 * Searches the DOM for the chart context element. Begins the search with `el` (or `this`
	 * if `el` is not provided) and proceeds up the ancestry tree until an element is found or
	 * the root of the tree has been reached.
	 *
	 * @param {HTMLElement} [el] The element on which to start the search. If not provided,
	 * 		`this` is used.
	 * @return {HTMLElement|undefined} The chart context element or undefined if an element
	 * 		is not found.
	 *
	 * @alias getContextContainer
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	getContextContainer(el) {
		if (el) {
			return BaseComponent.selfOrParentElement(el, "cq-context");
		}
		if (!this.contextContainer) {
			this.contextContainer = BaseComponent.selfOrParentElement(
				this,
				"cq-context"
			);
		}
		return this.contextContainer;
	}
	/**
	 * Searches the DOM for the chart container element. Begins the search with `el`
	 * (or `this`) and proceeds parent-by-parent up the ancestry tree until an element is
	 * found.
	 *
	 * @param {HTMLElement} [el] The element on which to start the search. If not provided,
	 * 		`this` is used.
	 * @return {HTMLElement|undefined} The chart container element or undefined if an element
	 * 		is not found.
	 *
	 * @alias getChartContainer
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @since 7.5.0
	 */
	getChartContainer(el) {
		return BaseComponent.selfOrParentElement(el || this, "ciq-chart");
	}
	/**
	 * Locates the nearest UI helper for a given attribute. If none exists, then it is created
	 * at the top node of the chart context.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @param {HTMLElement} node A node with either the `stxbind` or `stxtap` attribute.
	 * @param {String} [binding] The type of binding or helper name being looked for,
	 * 		otherwise the stxbind and then stxtap attributes are queried
	 * @param {String} attribute Either "stxtap" or "stxbind". Only required if
	 * 		`binding==null`.
	 * @return {CIQ.UI.Helper} A UI helper object.
	 *
	 * @alias CIQ.UI.BaseComponent.getHelper
	 * @memberof CIQ.UI.BaseComponent
	 */
	static getHelper(node, binding, attribute) {
		if (!node) return;
		if (!binding) {
			binding = node.getAttribute(attribute);
			if (!binding) return null;
		}
		var helper;
		var paren = binding.indexOf("(");
		var beforeParen = binding.substring(0, paren);
		var period = binding.indexOf(".");
		if (paren == -1 || beforeParen.indexOf(".") != -1) {
			// Layout or Layout.Chart or Layout.Chart('blah')
			var helperName = period === -1 ? binding : binding.substring(0, period);
			var context = node.context;
			if (!context) {
				if (!node.context) node.context = CIQ.UI.getMyContext(node);
				context = node.context;
			}
			if (!context) {
				const contextElement = node.closest("cq-context, [cq-context]");
				if (!contextElement) {
					console.log(
						node.tagName +
							" is not inside cq-context element" +
							". A context element is required when binding to a helper."
					);
					return null;
				}
				if (contextElement.bindingInitiated) {
					console.log(
						"No context attached to " +
							node.tagName +
							". A context is required when binding to a helper."
					);
				}
				return null;
			}
			helper = context.getAdvertised(helperName);
		} else {
			// bind to nearest web component // chart()
			var f = binding.substring(0, paren);
			var parent = node.parentElement;
			while (parent) {
				if (typeof parent[f] == "function") {
					return parent;
				}
				parent = parent.parentElement;
			}
		}
		return helper;
	}
	/**
	 * Activates an element that was tapped on via the stxtap attribute.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * The contents of stxtap should be the name of a class derived from
	 * {@link CIQ.UI.Element}, a member function of that class and the arguments.
	 *
	 * The DOM tree will be searched for an instance of that class.
	 * If one cannot be found, then an instance will be created on the spot.
	 * The instance itself should attach itself if it wants to be re-used.
	 *
	 * @param {HTMLElement} node The node that was tapped.
	 * @param {Event} e The event that triggered the function.
	 * @param {Object} [params] Object to send as last argument.
	 * @param {Boolean} [setter] If true,then use `stxsetget` instead of `stxtap`.
	 *
	 * @alias CIQ.UI.BaseComponent.activate
	 * @memberof CIQ.UI.BaseComponent
	 * @private
	 */
	static activate(node, e, params, setter) {
		var attribute = setter ? "stxsetget" : "stxtap";
		var method = CIQ.UI.splitMethod(node.getAttribute(attribute));
		if (!method) return;
		var helperName = method.helperName;
		var f = method.functionName;
		if (setter) f = "set" + f;
		// All helper methods take the node that was activated as the first argument
		var argArray = [{ node: node, e: e, params: params }].concat(method.args);
		if (helperName) {
			var helper = BaseComponent.getHelper(node, null, attribute);
			if (!helper[f]) {
				console.log("Method '" + f + "' not found in helper", helper);
				return;
			}
			helper[f].apply(helper, argArray);
		} else {
			// Look for nearest parent web component that contains our desired activation function
			var parent = node.parentElement;
			while (parent) {
				if (typeof parent[f] === "function") {
					parent[f].apply(parent, argArray);
				}
				parent = parent.parentElement;
			}
		}
	}
	/**
	 * We need to attach a safeClickTouch.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @param {HTMLElement} node The element to attach a tap event to.
	 * @param {Function} cb The callback when tapped.
	 *
	 * @alias makeTap
	 * @memberof CIQ.UI.BaseComponent.prototype
	 * @private
	 */
	makeTap(node, cb) {
		BaseComponent.makeTap(node, cb);
	}
	static makeTap(node, cb) {
		node.selectFC = cb;
		CIQ.UI.stxtap(node, cb);
	}
	/**
	 * Set bindings for a node that has been created dynamically. The attribute can be either
	 * "stxbind", "stxtap", or "stxsetget".
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * In the case of "stxsetget", a "set" and "get" will be prepended to the bound method.
	 * \<Helper\>.getXxxxx() is called once during this initialization. That method should set up
	 * a binding.
	 *
	 * When tapping (or changing a value in the case of an input field), \<Helper\>.setXxxx() is
	 * called.
	 *
	 * Bindings in web components search for the nearest parent component that contains the
	 * expected function (see the examples).
	 *
	 * @param {HTMLElement} node The node to bind.
	 * @param {object} [params] Parameters passed as the final argument.
	 * @return {boolean} true if binding succeeded; false if binding failed.
	 *
	 * @alias CIQ.UI.BaseComponent.bindNode
	 * @memberof CIQ.UI.BaseComponent
	 * @since
	 * - 7.0.0 Previously {@link CIQ.UI.BaseComponent.bind}.
	 * - 8.2.0 Added return boolean.
	 *
	 * @example
	 * <caption>Look for the next parent with method <code>tool()</code>.</caption>
	 * stxtap = "tool('gartley')"
	 *
	 * @example
	 * <caption>To explicitly target a web component, use a prefix.</caption>
	 * stxtap = "DrawingToolbar.tool('gartley')"
	 */
	static bindNode(node, params) {
		var helper;
		var binding = node.getAttribute("stxbind");
		var tap = node.getAttribute("stxtap");
		var setget = node.getAttribute("stxsetget");
		// One way binding
		function bindHelper(helper) {
			var method;
			var paren = binding.indexOf("(");
			method = binding.substring(binding.indexOf(".") + 1);
			if (paren !== -1) {
				method = binding.substring(0, paren);
			}
			if (helper) helper[method](node);
		}
		if (binding && binding !== "") {
			helper = BaseComponent.getHelper(node, binding, "stxbind");
			if (!helper) return false;
			bindHelper(helper);
		}
		// "tap" binding
		function closure(node) {
			return function (e) {
				// BaseComponent.e=e;
				BaseComponent.activate(node, e, params, false);
			};
		}
		if (tap && tap !== "") {
			if (
				node.tagName == "INPUT" &&
				(node.type === "text" || node.type === "number")
			) {
				BaseComponent.inputEntry(node, closure(node));
			} else {
				BaseComponent.makeTap(node, closure(node));
			}
		}
		// Setter/Getter binding
		function setGetHelper(helper) {
			function createSetter() {
				return function (e) {
					// BaseComponent.e=e;
					BaseComponent.activate(node, e, params, true);
				};
			}
			var method = CIQ.UI.splitMethod(setget);
			if (!method) {
				console.log("Syntax error " + setget);
				return;
			}
			var argArray = [node].concat(method.args).concat(params);
			var getter = "get" + method.functionName;
			if (helper && helper[getter]) helper[getter].apply(helper, argArray);
			if (node.type === "text" || node.type === "number") {
				BaseComponent.inputEntry(node, createSetter());
			} else {
				BaseComponent.makeTap(node, createSetter());
			}
		}
		if (setget) {
			helper = BaseComponent.getHelper(node, setget, "stxsetget");
			if (!helper) return false;
			setGetHelper(helper);
		}
		return true;
	}
	/**
	 * Schedules a node to be processed for binding. The binding occurs in the next tick, in
	 * order to provide time for the DOM to be completed.
	 *
	 * @param {HTMLElement} node The node to be bound.
	 *
	 * @alias CIQ.UI.BaseComponent.scheduleForBinding
	 * @member CIQ.UI.BaseComponent
	 * @private
	 */
	static scheduleForBinding(node, holder) {
		BaseComponent.scheduledBindings.push({ node: node, parentTag: holder });
		// This ensures that one and only one nextTick event will occur
		if (BaseComponent.timeout) clearTimeout(BaseComponent.timeout);
		BaseComponent.timeout = setTimeout(BaseComponent.nextTick, 0);
	}
	/**
	 * Attaches a keyboard input entry event.
	 *
	 * @param {HTMLElement} node The element to which the input entry event is attached.
	 * @param {Function} cb The callback function invoked when input entry occurs.
	 *
	 * @alias inputEntry
	 * @memberof CIQ.UI.BaseComponent.prototype
	 */
	inputEntry(node, cb) {
		BaseComponent.inputEntry(node, cb);
	}
	static inputEntry(node, cb) {
		node.addEventListener("keypress", function (e) {
			switch (e.which) {
				case 13:
				case 9:
					cb();
			}
		});
	}
	/**
	 * Claim any keystrokes that come in. Once claimed, any keystrokes that come in are passed
	 * to the helper. The helper can then choose to capture or propagate the keystrokes. This
	 * enables a helper to capture keystrokes even if it doesn't have mouse focus.
	 *
	 * @param {HTMLElement} helper The element that should claim a keystroke.
	 *
	 * @alias addClaim
	 * @memberof CIQ.UI.BaseComponent.prototype
	 */
	addClaim(helper) {
		claims.push({ helper: helper });
	}
	/**
	 * Remove a claim on keystrokes.
	 *
	 * @param {CIQ.UI.Helper} helper Helper or `ContextTag` from which the claim on
	 * 		keystrokes is removed.
	 *
	 * @alias removeClaim
	 * @memberof CIQ.UI.BaseComponent.prototype
	 */
	removeClaim(helper) {
		for (var i = 0; i < claims.length; i++) {
			if (claims[i].helper === helper) {
				claims.splice(i, 1);
				return;
			}
		}
	}
	/**
	 * Travels the DOM tree and locates `stxbind` attributes.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the web components can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * UI elements can use these to configure menus or dialogs. To effect reverse binding,
	 * set the value of the `stxbind` attribute to a Helper class name and data element. For
	 * instance `Layout.chartStyle`.
	 *
	 * The Helper element will seek out all children with `stxtap` attribution and examine
	 * the arguments to that function call for a match.
	 *
	 * @param {HTMLElement} [traverseNode] Specify the node to traverse. Defaults to `topNode`
	 * 		for the context.
	 *
	 * @alias CIQ.UI.BaseComponent.buildReverseBindings
	 * @memberof CIQ.UI.BaseComponent
	 */
	static buildReverseBindings(traverseNode) {
		if (CIQ.UI.bypassBindings) return;
		var acceptFunc = function (node) {
			if (
				node.hasAttribute("stxbind") ||
				node.hasAttribute("stxtap") ||
				node.hasAttribute("stxsetget")
			) {
				return NodeFilter.FILTER_ACCEPT;
			}
		};
		var walker = document.createNodeIterator(
			traverseNode,
			NodeFilter.SHOW_ELEMENT,
			CIQ.isIE ? acceptFunc : { acceptNode: acceptFunc },
			false
		);
		var node;
		node = walker.nextNode();
		while (node) {
			BaseComponent.scheduleForBinding(node, traverseNode);
			node = walker.nextNode();
		}
	}
	/**
	 * Gets called once and only once per DOM processing cycle, and only if it's been
	 * triggered by a call to `scheduledForBinding`.
	 *
	 * @alias CIQ.UI.BaseComponent.nextTick
	 * @member CIQ.UI.BaseComponent
	 * @private
	 */
	static nextTick() {
		if (!CIQ.UI.release) return; // UI hasn't started yet
		clearTimeout(BaseComponent.timeout);
		var scheduledBindings = BaseComponent.scheduledBindings;
		// We traverse through the bindings backwards which ensures that we attempt to bind to the closest
		// web component ancestor to the actual binding.
		for (var i = scheduledBindings.length - 1; i >= 0; i--) {
			var binding = scheduledBindings[i];
			if (binding.node.ciqAlreadyBound) continue; // a node can only be bound once in it's lifetime
			binding.node.ciqAlreadyBound = BaseComponent.bindNode(binding.node, {
				parent: binding.parentTag
			});
		}
	}
	/**
	 * Searches the DOM for an element that has the CSS class, HTML attribute, or tag name
	 * (node name) specified in `classOrAttributeOrTag`.
	 *
	 * Begins the search with `startEl` and proceeds up the ancestry tree until an element is
	 * found or the root of the tree has been reached.
	 *
	 * @param {HTMLElement} startEl The element on which to start the search.
	 * @param {String} classOrAttributeOrTag The CSS class, HTML attribute, or node name for
	 * 		which to search.
	 * @return {HTMLElement|undefined} The found element or undefined if an element was not
	 * 		found.
	 *
	 * @alias CIQ.UI.BaseComponent.selfOrParentElement
	 * @memberof CIQ.UI.BaseComponent
	 * @since 7.5.0
	 */
	static selfOrParentElement(startEl, classOrAttributeOrTag) {
		let el = startEl;
		while (el) {
			if (
				el.classList.contains(classOrAttributeOrTag) ||
				el.getAttribute(classOrAttributeOrTag) !== null ||
				el.nodeName.toLowerCase() === classOrAttributeOrTag
			)
				return el;
			el = el.parentElement;
		}
	}
	/**
	 * Walks an object path by means of the elements of the `path` argument, excluding the
	 * last element. Starts the walk with `startObj`.
	 *
	 * For example, if the path is "x.y.z.end" and the starting object is myObj, the function
	 * attempts to find myObj.x.y.z.
	 *
	 * @param {String} path A string of dot-separated elements, such as "channel.breakpoint".
	 * @param {Object} startObj The initial object in the object path, such as an instance of
	 * 		`CIQ.ChartEngine`.
	 * @return {Object} An object literal containing the last property in the path and an
	 * 		object referenced by the succession of the preceding path elements; for example,
	 * 		the path `channel.breakpoint` and an instance of the chart engine as the starting
	 * 		object would produce {"breakpoint", chartEngine.channel}. If any of the path
	 * 		elements (excluding the last) is not a property of the object path, the function
	 * 		returns an empty object ({}).
	 *
	 * @alias CIQ.UI.BaseComponent.toPropAndObject
	 * @memberof CIQ.UI.BaseComponent
	 * @since 7.5.0
	 */
	static toPropAndObject(path, startObj) {
		const arr = path.split(".");
		const prop = arr.pop();
		const obj = arr.reduce(
			(obj, name) => (obj[name] !== undefined ? obj[name] : (obj[name] = {})),
			startObj
		);
		return { prop, obj };
	}
	/**
	 * Retrieves a channel object and property from the given path.
	 *
	 * @param {*} path The channel path.
	 * @param {CIQ.ChartEngine} [stx] A reference to the chart engine.
	 * @param {Object} [self] A component reference used to optionally obtain a reference to
	 * 		the chart engine.
	 * @return {Object|undefined} An object containing the channel object and property name.
	 * 		Returns undefined if the path is not provided or if one of `stx` or `self` is not
	 * 		provided.
	 *
	 * @alias CIQ.UI.BaseComponent.getChannel
	 * @memberof CIQ.UI.BaseComponent
	 * @since 7.5.0
	 */
	static getChannel(path, stx, self) {
		if (!path) {
			console.warn("Missing channel path");
			return {};
		}
		if (!stx && !self) {
			console.warn("Chart engine not provided while retrieving ", path);
			return {};
		}
		if (!stx && !self.stx) {
			if (!self.container) {
				self.container = CIQ.UI.getMyContext(self);
			}
			self.stx = self.container.stx;
		}
		const { obj, prop } = BaseComponent.toPropAndObject(path, stx || self.stx);
		return { obj, prop };
	}
	/**
	 * Finds the elements in `items` that have a `cq-focused` attribute.
	 *
	 * @param {NodeList} items A list of elements that are selectable via keyboard navigation.
	 * @return {array} The elements in `items` that have a `cq-focused` attribute, or an empty
	 * 		array if no elements are found.
	 *
	 * @memberof CIQ.UI.BaseComponent#
	 * @alias findFocused
	 * @since 8.3.0
	 */
	findFocused(items) {
		return Array.from(items || []).filter((item) =>
			item.matches("[cq-focused]")
		);
	}
	/**
	 * Focuses the next item in the tab order.
	 *
	 * Locates the first element in `items` that has a `cq-focused` attribute. If an element is
	 * found, the attribute is removed from all elements in `items`, and `cq-focused` is applied
	 * to the element that follows (in the tab order) the element that was found.
	 *
	 * If no elements are found with the `cq-focused` attribute, the attribute is applied to the
	 * first element in `items` (last element if `reverse` is true). If the last element in `items`
	 * (first element if `reverse` is true) is found to have the `cq-focused` attribute, focus
	 * remains on that element.
	 *
	 * @param {NodeList} items A list of elements that are selectable via keyboard navigation.
	 * @param {boolean} [reverse] If true, the operation is performed in reverse order; that is,
	 * 		from the last element in `items` to the first.
	 * @return {boolean} true if a `cq-focused` attribute has changed, false if nothing has changed.
	 *
	 * @memberof CIQ.UI.BaseComponent#
	 * @alias focusNextItem
	 * @since 8.3.0
	 *
	 * @see [focusItem]{@link CIQ.UI.BaseComponent#focusItem}
	 */
	focusNextItem(items, reverse) {
		const focused = this.findFocused(items);
		let i = -1;
		if (focused.length) {
			// find our location in the list of items
			for (i = 0; i < items.length; i++) if (items[i] === focused[0]) break;
		}
		if (reverse) {
			// Find the previous available item
			do {
				i--;
				if (i < 0) break;
			} while (!CIQ.trulyVisible(items[i]));
		} else {
			// Find the next available item
			do {
				i++;
				if (i >= items.length) break;
			} while (!CIQ.trulyVisible(items[i]));
		}
		if (i > -1 && i < items.length && items[i] !== focused[0]) {
			this.removeFocused(items);
			this.focusItem(items[i]);
			return true;
		}
		return false;
	}
	/**
	 * Adds a `cq-focused` attribute to `item` and highlights `item`.
	 *
	 * @param {HTMLElement} item Element that receives keyboard focus and is highlighted.
	 *
	 * @memberof CIQ.UI.BaseComponent#
	 * @alias focusItem
	 * @since 8.3.0
	 */
	focusItem(item) {
		item.setAttribute("cq-focused", "true");
		this.highlightItem(item);
	}
	/**
	 * Removes the `cq-focused` attribute from all elements in `items`.
	 *
	 * @param {NodeList} items A list of elements that are selectable via keyboard navigation.
	 *
	 * @memberof CIQ.UI.BaseComponent#
	 * @alias removeFocused
	 * @since 8.3.0
	 */
	removeFocused(items) {
		items.forEach((item) => item.removeAttribute("cq-focused"));
	}
	/**
	 * Sets the navigation highlight DOM element to the size and position of the provided element
	 * if the `keyboardNavigation` property has been set in this component via the keystrokeHub.
	 *
	 * @param {HTMLElement} item Element to highlight.
	 *
	 * @memberof CIQ.UI.BaseComponent#
	 * @alias highlightItem
	 * @private
	 * @since 8.3.0
	 */
	highlightItem(item) {
		if (
			!item ||
			!this.keyboardNavigation ||
			!this.keyboardNavigation.highlightPosition
		)
			return;
		const { x, y, width, height } = item.getBoundingClientRect();
		this.keyboardNavigation.highlightPosition({
			element: item,
			position: { x, y, width, height }
		});
	}
	/**
	 * Highlights the first element in the provided node list that has a `cq-focused` attribute.
	 *
	 * @param {NodeList} items A list of elements that are selectable via keyboard navigation.
	 *
	 * @memberof CIQ.UI.BaseComponent#
	 * @alias highlightFocusedItem
	 * @private
	 * @since 8.3.0
	 */
	highlightFocusedItem(items) {
		let focused = this.findFocused(items);
		if (focused.length) this.highlightItem(focused[0]);
	}
	/**
	 * Simulates a mouse click on the provided element as the result of a keystroke.
	 *
	 * @param {HTMLElement} item Element to click.
	 * @param {Event} e The keystroke event.
	 * @return {boolean} true if the element received the simulated clicked; otherwise, false.
	 *
	 * @memberof CIQ.UI.BaseComponent#
	 * @alias clickItem
	 * @private
	 * @since 8.3.0
	 */
	clickItem(item, e) {
		if (!item) return;
		if (item.selectFC) {
			item.selectFC.call(item, e);
		} else {
			// Simulate a click
			item.dispatchEvent(new Event("pointerdown"));
			item.dispatchEvent(new Event("pointerup"));
		}
		return true;
	}
	/**
	 * Selects (clicks) the first element in `items` that has a `cq-focused` attribute.
	 *
	 * @param {NodeList} items A list of elements that are selectable via keyboard navigation.
	 * @param {Event} e The keystroke event.
	 *
	 * @memberof CIQ.UI.BaseComponent#
	 * @alias clickFocusedItem
	 * @since 8.3.0
	 */
	clickFocusedItem(items, e) {
		let focused = this.findFocused(items);
		if (focused.length) this.clickItem(focused[0], e);
	}
}
BaseComponent.scheduledBindings = [];
CIQ.UI.BaseComponent = BaseComponent;
/**
 * Abstract class for web components that use a {@link CIQ.UI.Context} to gain access to an
 * instance of the chart engine.
 *
 * @name CIQ.UI.ContextTag
 * @class
 * @extends CIQ.UI.BaseComponent
 *
 * @see {@link WebComponents}
 */
class ContextTag extends BaseComponent {
	constructor() {
		super();
		this.injections = [];
	}
	/**
	 * Convenience function that creates an array of injections for the component and sets a
	 * variable of node equal to self.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @alias connectedCallback
	 * @memberof CIQ.UI.ContextTag.prototype
	 */
	connectedCallback() {
		if (this.attached) return;
		this.setContextHolder();
		super.connectedCallback();
	}
	/**
	 * Removes all the the injections for a context tag and resets the tag to its default
	 * state.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @alias disconnectedCallback
	 * @memberof CIQ.UI.ContextTag.prototype
	 */
	disconnectedCallback() {
		if (this.context) {
			var i;
			for (i = 0; i < this.injections.length; i++) {
				this.context.stx.removeInjection(this.injections[i]);
			}
			this.injections = [];
			for (i = 0; i < this.eventListeners.length; i++) {
				this.context.stx.removeEventListener(this.eventListeners[i]);
			}
			this.eventListeners = [];
		}
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}
	/**
	 * Stores the component in the context holder (an array associated with the `cq-context`
	 * element) so that when the context is started, it knows that this tag is contextual.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @alias setContextHolder
	 * @memberof CIQ.UI.ContextTag.prototype
	 */
	setContextHolder() {
		var nearestContext = this.closest("cq-context,*[cq-context]");
		if (!nearestContext) {
			console.log("No cq-context found for " + this.tagName);
			return;
		}
		var contextElement = nearestContext;
		var storage = Context.assembleContext(contextElement);
		storage.Components.push(this);
		// This will only get called for components that are generated dynamically, after a context
		// has already been established
		if (storage.context) this.setContextPrivate(storage.context);
	}
	/**
	 * Called for a registered component when the context is constructed. This method does
	 * nothing; you must override it with a method that performs context initialization.
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias setContext
	 * @memberof CIQ.UI.ContextTag.prototype
	 */
	setContext(context) {
		/* override me */
	}
	/**
	 * Sets the context.
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias setContextPrivate
	 * @memberof CIQ.UI.ContextTag.prototype
	 * @private
	 */
	setContextPrivate(context) {
		this.context = context;
		this.uiManager = CIQ.UI.getUIManager();
		if (this.hasAttribute("cq-marker") && !this.convertedToMarker) {
			this.convertedToMarker = true;
			this.marker = new CIQ.Marker({
				stx: context.stx,
				node: this,
				xPositioner: "none",
				yPositioner: "none",
				label: "component",
				permanent: true
			});
		}
		this.timeout = setTimeout(
			(function (s, c) {
				return function () {
					s.setContext(c);
					s.timeout = null;
				};
			})(this, context)
		);
	}
	/**
	 * Adds an injection to the chart engine.
	 *
	 * @param {String} position Where in the animation loop the injection should be added;
	 * 		append or prepend.
	 * @param {String} injection The name of the function to which the injection is added.
	 * @param {Function} code The callback to fire when the injection occurs.
	 *
	 * @alias addInjection
	 * @memberof CIQ.UI.ContextTag.prototype
	 * @private
	 */
	addInjection(position, injection, code) {
		this.injections.push(this.context.stx[position](injection, code));
	}
}
CIQ.UI.ContextTag = ContextTag;
/**
 * A tag that is modally aware of the chart.
 *
 * @name CIQ.UI.ModalTag
 * @class
 * @extends CIQ.UI.ContextTag}
 */
class ModalTag extends ContextTag {
	constructor() {
		super();
	}
	/**
	 * @alias connectedCallback
	 * @memberof CIQ.UI.ModalTag.prototype
	 * @private
	 */
	connectedCallback() {
		if (this.attached) return;
		this.onpointerover = function () {
			this.modalBegin();
		};
		this.onpointerout = function () {
			this.modalEnd();
		};
		super.connectedCallback();
	}
	/**
	 * @alias modalBegin
	 * @memberof CIQ.UI.ModalTag.prototype
	 * @private
	 */
	modalBegin() {
		if (!this.context) return;
		this.context.stx.modalBegin();
	}
	/**
	 * @alias modalEnd
	 * @memberof CIQ.UI.ModalTag.prototype
	 * @private
	 */
	modalEnd() {
		if (!this.context) return;
		if (this.uiManager.activeMenuStack.length) return; // If an active menu then don't turn off the modal. Let uiManager handle it.
		this.context.stx.modalEnd();
	}
}
CIQ.UI.ModalTag = ModalTag;
/**
 * Base class for tags that are contained in a `cq-dialog` tag.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @name CIQ.UI.DialogContentTag
 * @class
 * @extends CIQ.UI.BaseComponent
 */
class DialogContentTag extends BaseComponent {
	constructor() {
		super();
	}
	/**
	 * Closes the dialog.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @alias close
	 * @memberof CIQ.UI.DialogContentTag.prototype
	 */
	close() {
		var dialog = this.closest("cq-dialog");
		if (dialog) dialog.close();
		Array.from(this.querySelectorAll("cq-swatch")).forEach(function (el) {
			if (el.colorPicker) el.colorPicker.close();
		});
	}
	/**
	 * Opens the parent dialog, the nearest `cq-dialog` element. Sets the chart context if a
	 * context is provided in `params`.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @param {Object} [params] Contains the chart context.
	 * @param {CIQ.UI.Context} [params.context] A context to set. See
	 * 		[setContext]{@link CIQ.UI.DialogContentTag#setContext}.
	 *
	 * @alias open
	 * @memberof CIQ.UI.DialogContentTag.prototype
	 */
	open(params) {
		if (params && params.context) this.setContext(params.context);
		var tagName = this.tagName.toLowerCase();
		var closest = this.closest("cq-dialog,cq-menu");
		closest.addActiveAttribute(tagName);
		closest.open(params);
	}
	/**
	 * Dynamically sets the context for a dialog so that it knows which chart to change when
	 * there are multiple charts on the screen.
	 *
	 * @param {CIQ.UI.Context} context The context to set.
	 *
	 * @alias setContext
	 * @memberof CIQ.UI.DialogContentTag.prototype
	 */
	setContext(context) {
		// Make sure when the context changes, the contexts of all bound children change as well.
		// If there are ever multiple possible contexts (as is the case for multi-chart), the context
		// of a component may get set (eg in BaseComponent.getHelper()) and subsequently never changed,
		// even when it should, causing unexpected behavior.
		this.node.find("[stxtap],[stxbind],[stxsetget]").each(function () {
			this.context = context;
		});
		this.context = context;
	}
}
CIQ.UI.DialogContentTag = DialogContentTag;
/**
 * Abstract class for UI Helpers.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @param {HTMLElement} node DOM node.
 * @param {CIQ.UI.Context} context UIContext the helper is associated with
 * @name CIQ.UI.Helper
 * @constructor
 */
CIQ.UI.Helper = function (node, context) {
	this.node = node;
	this.context = context;
	this.injections = []; // To keep track of injections for later removal
};
/**
 * Adds an injection. These will be automatically destroyed if the helper object is destroyed.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @param {String} position  "prepend" or "append"
 * @param {String} injection The injection name. i.e. "draw"
 * @param {Function} code      The code to be run
 * @memberof CIQ.UI.Helper
 */
CIQ.UI.Helper.prototype.addInjection = function (position, injection, code) {
	this.injections.push(this.context.stx[position](injection, code));
};
/**
 * Removes injections from the ChartEngine
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @memberof CIQ.UI.Helper
 */
CIQ.UI.Helper.prototype.destroy = function () {
	for (var i = 0; i < this.injections.length; i++) {
		this.context.stx.removeInjection(this.injections[i]);
	}
	this.injections = [];
};
/**
 * UI Helper that keeps the heads up display operating.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * There are three modes:
 * - params.followMouse=true - The heads up display will follow the mouse
 * - params.staticNode=true - The heads up will simply update a DOM node managed by you
 * - default - The heads up will be a marker within the chart, positioned in the chart panel unless overidden
 *
 * @param {HTMLElement} node The node which should be the template for the heads up.
 * @param {CIQ.UI.Context} context The context
 * @param {object} [params] Optional parameters
 * @param {boolean} [params.autoStart=true] If true then start the heads up on construction
 * @param {boolean} [params.followMouse=false] If true then the heads up will follow the mouse. In this case, the node should be a template
 * that will be removed from the document and then added dynamically into the chart container.
 * @param {boolean} [params.staticNode=false] If true then the node will not be added as a marker
 * @param {string} [params.showClass="stx-show"] The class that will be added to display the heads up
 * @name CIQ.UI.HeadsUp
 * @constructor
 * @since
 * - 3.0.0
 * - 6.0.0 Now also has internationalizer support for dates. See {@link CIQ.I18N.setLocale} or {@link CIQ.I18N.localize}.
 */
CIQ.UI.HeadsUp = function (node, context, params) {
	this.params = params ? params : {};
	if (typeof this.params.autoStart == "undefined") this.params.autoStart = true;
	this.node = node;
	node.remove();
	this.context = context;
	this.injections = []; // Keep track on instance level, not on prototype (CIQ.UI.Helper)
	this.maxVolume = { lastCheckDate: null, value: 0 }; // This contains the maximum volume in the dataSet, used to generate the volume icon element
	if (this.params.autoStart) this.begin();
};
CIQ.inheritsFrom(CIQ.UI.HeadsUp, CIQ.UI.Helper);
/**
 * Begins the heads up operation. This uses injections to manage the contents and location of the display. See {@link CIQ.UI.HeadsUp#end} to stop
 * the heads up.
 * @memberof CIQ.UI.HeadsUp
 * @private
 */
CIQ.UI.HeadsUp.prototype.begin = function () {
	if (this.injections.length) return; //we've already begun since the injections are there
	if (!CIQ.Marker) return;
	if (!CIQ.Marker.HeadsUp) {
		/**
		 * A heads up marker for displaying OHLC values on the chart.
		 *
		 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
		 *
		 * @name CIQ.Marker.HeadsUp
		 * @constructor
		 * @param {Object} params
		 * @param {string} showClass
		 */
		CIQ.Marker.HeadsUp = function (params, showClass) {
			if (!this.className) this.className = "CIQ.Marker.HeadsUp";
			CIQ.Marker.call(this, params);
			this.prevTick = null;
			this.showClass = showClass;
		};
		CIQ.inheritsFrom(CIQ.Marker.HeadsUp, CIQ.Marker, false);
		/**
		 * Determines the location of the HeadsUp Marker.
		 *
		 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
		 *
		 * @memberof CIQ.Marker.HeadsUp
		 * @param {Object} params
		 */
		CIQ.Marker.HeadsUp.placementFunction = function (params) {
			function getBottomPixel(stx, panel, containerHeight, price) {
				return Math.round(containerHeight - stx.pixelFromPrice(price, panel));
			}
			var panel = params.panel;
			var chart = panel.chart;
			var stx = params.stx;
			var useHighs = stx.chart.highLowBars;
			if (!params.showClass) params.showClass = "stx-show";
			for (var i = 0; i < params.arr.length; ++i) {
				var marker = params.arr[i];
				var node = marker.node;
				var nodeClass = node.classList;
				if (panel.hidden || !stx.insideChart) {
					nodeClass.remove(params.showClass);
					return;
				}
				if (marker.params.x < 0 || marker.params.x >= chart.dataSet.length) {
					nodeClass.remove(params.showClass);
					return;
				}
				// show the hud if on, except if the crosshair is on or a drawing tool is selected
				if (stx.currentVectorParameters.vectorType) {
					nodeClass.remove(params.showClass);
					return;
				}
				var quote = chart.dataSet[marker.params.x];
				var x = stx.pixelFromTick(marker.params.x);
				if (!quote || x < chart.left || x > chart.right) {
					nodeClass.remove(params.showClass);
					return;
				}
				// gap bar, hide HUD
				if (
					!quote[stx.chart.defaultPlotField] &&
					quote[stx.chart.defaultPlotField] !== 0
				) {
					nodeClass.remove(params.showClass);
					return;
				}
				nodeClass.add(params.showClass);
				var hw = CIQ.elementDimensions(node);
				if (!marker.clientWidth) marker.clientWidth = hw.width;
				if (!marker.clientHeight) marker.clientHeight = hw.height;
				if (marker.clientWidth > x) {
					nodeClass.remove("stx-left");
					nodeClass.add("stx-right");
					Object.assign(marker.node.style, {
						left: x + "px",
						right: "auto"
					});
				} else {
					nodeClass.add("stx-left");
					nodeClass.remove("stx-right");
					Object.assign(marker.node.style, {
						right: stx.chart.canvasWidth - x + "px",
						left: "auto"
					});
				}
				var bottom;
				var containerHeight = marker.params.chartContainer
					? stx.chart.canvasHeight
					: panel.bottom;
				if (useHighs) {
					bottom = getBottomPixel(
						stx,
						panel,
						containerHeight,
						stx.getBarBounds(quote)[panel.yAxis.flipped ? "low" : "high"]
					);
				} else {
					bottom = getBottomPixel(
						stx,
						panel,
						containerHeight,
						quote[stx.chart.defaultPlotField]
					);
				}
				// Keep below top of screen
				var top = containerHeight - bottom - marker.clientHeight + stx.top;
				if (top < 0) {
					nodeClass.add("stx-below");
					bottom =
						(useHighs
							? getBottomPixel(
									stx,
									panel,
									containerHeight,
									stx.getBarBounds(quote).low
							  )
							: bottom) - marker.clientHeight;
				} else {
					nodeClass.remove("stx-below");
				}
				var bottomPX = bottom + "px";
				if (marker.node.style.bottom != bottomPX) {
					marker.node.style.bottom = bottomPX;
				}
			}
		};
	}
	var params;
	if (this.params.followMouse) {
		this.node.style.top = "auto"; // allow style.bottom to override the default top value
		params = {
			stx: this.context.stx,
			label: "headsup",
			xPositioner: "bar",
			chartContainer: true,
			x: 0,
			node: this.node
		};
		this.marker = new CIQ.Marker.HeadsUp(params, this.params.showClass);
		this.addInjection(
			"append",
			"handleMouseOut",
			(function (self) {
				return function () {
					self.followMouse(-1);
				};
			})(this)
		);
	} else if (this.params.staticNode) {
		// placeholder
	} else {
		Object.assign(this.node.style, { top: "", left: "" }); // Remove any existing styles
		params = {
			stx: this.context.stx,
			label: "headsup",
			xPositioner: "none",
			chartContainer: false,
			node: this.node
		};
		CIQ.extend(params, this.params); // Override default marker setup by passing marker parameters into CIQ.UI.HaedsUp
		this.marker = new CIQ.Marker(params);
	}
	this.calculateMaxVolume();
	this.addInjection(
		"prepend",
		"headsUpHR",
		(function (self) {
			return function () {
				self.position();
			};
		})(this)
	);
	this.addInjection(
		"append",
		"createXAxis",
		(function (self) {
			return function () {
				self.position();
			};
		})(this)
	);
	this.addInjection(
		"append",
		"createDataSet",
		(function (self) {
			return function (dontRoll, whichChart, params) {
				self.calculateMaxVolume(params.appending);
			};
		})(this)
	);
};
/**
 * Stops the heads up from operating by removing injections and hiding. You can start it again by calling {@link CIQ.UI.HeadsUp#begin}.
 * @memberOf CIQ.UI.HeadsUp
 * @private
 */
CIQ.UI.HeadsUp.prototype.end = function () {
	if (this.marker) this.marker.remove();
	this.destroy();
	this.marker = null;
};
/**
 * @memberof CIQ.UI.HeadsUp
 * @param {boolean} appending
 * @private
 */
CIQ.UI.HeadsUp.prototype.calculateMaxVolume = function (appending) {
	if (!appending) this.maxVolume = { lastCheckDate: null, value: 0 };
	var dataSet = this.context.stx.chart.dataSet;
	if (!dataSet || !dataSet.length) return;
	for (var i = dataSet.length - 1; i >= 0; i--) {
		var q = dataSet[i];
		if (q.DT < this.maxVolume.lastCheckDate) break;
		if (q.Volume > this.maxVolume.value) this.maxVolume.value = q.Volume;
	}
	this.maxVolume.lastCheckDate = dataSet[dataSet.length - 1].DT;
};
/**
 * Determines information inside of the HeadsUp display based on position.
 * @memberof CIQ.UI.HeadsUp
 * @private
 */
CIQ.UI.HeadsUp.prototype.position = function () {
	var stx = this.context.stx;
	var bar = stx.barFromPixel(stx.cx);
	this.tick = stx.tickFromPixel(stx.cx);
	var prices = stx.chart.xaxis[bar];
	//var currentQuote=stx.chart.currentQuote;
	var plotField = stx.chart.defaultPlotField;
	var highLowBars = stx.chart.highLowBars;
	if (!plotField || highLowBars) plotField = "Close";
	var node = this.node;
	var self = this;
	function formatPrice(value) {
		var numStr = "";
		var chartScale = stx.layout.chartScale,
			panel = stx.chart.panel,
			yAxis = stx.chart.yAxis;
		if (yAxis.originalPriceFormatter && yAxis.originalPriceFormatter.func) {
			numStr = yAxis.originalPriceFormatter.func(stx, panel, value);
		} else if (
			yAxis.priceFormatter &&
			chartScale != "percent" &&
			chartScale != "relative"
		) {
			numStr = yAxis.priceFormatter(stx, panel, value);
		} else {
			numStr = stx.formatYAxisPrice(value, panel);
		}
		return numStr.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, "$1");
	}
	function printValues() {
		var $node = CIQ.UI.$(node);
		self.timeout = null;
		$node.find("cq-hu-price").text("N/A");
		$node.find("cq-hu-open").text("N/A");
		$node.find("cq-hu-close").text("N/A");
		$node.find("cq-hu-high").text("N/A");
		$node.find("cq-hu-low").text("N/A");
		$node.find("cq-hu-date").text("N/A");
		$node.find("cq-hu-volume").text("N/A");
		$node.find("cq-volume-rollup").text("");
		function valOrNA(text) {
			return CIQ.isValidNumber(parseFloat(text)) ? text : "N/A";
		}
		if (prices) {
			if (prices.data) {
				var quote = CIQ.clone(prices.data);
				if (quote.Open === undefined) quote.Open = quote.Close;
				if (quote.High === undefined)
					quote.High = Math.max(quote.Open, quote.Close);
				if (quote.Low === undefined)
					quote.Low = Math.min(quote.Open, quote.Close);
				$node.find("cq-hu-open").text(formatPrice(valOrNA(quote.Open)));
				$node.find("cq-hu-price").text(formatPrice(valOrNA(quote[plotField])));
				$node.find("cq-hu-close").text(formatPrice(valOrNA(quote.Close)));
				$node.find("cq-hu-high").text(formatPrice(valOrNA(quote.High)));
				$node.find("cq-hu-low").text(formatPrice(valOrNA(quote.Low)));
				var volume = CIQ.condenseInt(quote.Volume);
				var rollup = volume.charAt(volume.length - 1);
				if (rollup > "9") {
					volume = volume.substring(0, volume.length - 1);
					$node.find("cq-volume-rollup").text(rollup.toUpperCase());
				}
				$node.find("cq-hu-volume").text(volume);
				var tickDate = quote.displayDate;
				if (!tickDate) tickDate = quote.DT;
				if (stx.internationalizer) {
					if (CIQ.ChartEngine.isDailyInterval(stx.layout.interval)) {
						$node
							.find("cq-hu-date")
							.text(stx.internationalizer.yearMonthDay.format(tickDate));
					} else {
						$node
							.find("cq-hu-date")
							.text(
								stx.internationalizer.yearMonthDay.format(tickDate) +
									" " +
									stx.internationalizer.hourMinute.format(tickDate)
							);
					}
				} else {
					if (CIQ.ChartEngine.isDailyInterval(stx.layout.interval)) {
						$node
							.find("cq-hu-date")
							.text(CIQ.mmddyyyy(CIQ.yyyymmddhhmm(tickDate)));
					} else {
						$node
							.find("cq-hu-date")
							.text(CIQ.mmddhhmm(CIQ.yyyymmddhhmmssmmm(tickDate)));
					}
				}
				var visuals = $node.find("cq-volume-visual");
				if (visuals.length) {
					var relativeCandleSize = self.maxVolume.value
						? quote.Volume / self.maxVolume.value
						: 0;
					visuals.css({ width: Math.round(relativeCandleSize * 100) + "%" });
				}
			}
			// not sure why we'd need this, commenting out for now
			/*if(currentQuote && currentQuote[plotField] && self.tick==stx.chart.dataSet.length-1){
					node.find("cq-hu-price").text(valOrNA(stx.formatPrice(currentQuote[plotField])));
				}*/
		}
	}
	if (
		this.tick != this.prevTick ||
		(prices && +prices.DT == +stx.chart.endPoints.end)
	) {
		if (this.timeout) clearTimeout(this.timeout);
		var ms = this.params.followMouse ? 0 : 0; // IE and FF struggle to keep up with the dynamic heads up.
		this.timeout = setTimeout(printValues, ms);
	}
	this.prevTick = this.tick; // We don't want to update the dom every pixel, just when we cross into a new candle
	if (this.params.followMouse) {
		if (stx.openDialog) this.tick = -1; // Turn off the headsup when a modal is on
		this.followMouse(this.tick);
	}
};
CIQ.UI.HeadsUp.prototype.followMouse = function (tick) {
	this.marker.params.x = tick;
	var self = this;
	self.marker.render();
};
CIQ.UI.DrawingEdit = DrawingEdit;
/**
 * UI Helper to allow drawings to be edited, cloned, or deleted with a context menu via <cq-drawing-context>.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 *
 * @name CIQ.UI.DrawingEdit
 * @param {HTMLElement} [node=context.topNode] Automatically attaches to the top node of the context
 * @param {CIQ.UI.Context} context The context for the chart
 * @constructor
 * @example <caption>Required DOM</caption>
 * <cq-dialog>
 * 	<cq-drawing-context>
 * 		<div stxtap="DrawingEdit.text()" cq-edit-text>Text</div>
 * 		<div stxtap="DrawingEdit.edit()">Edit</div>
 * 		<div stxtap="DrawingEdit.clone()">Clone</div>
 * 		<div stxtap="DrawingEdit.remove()">Delete</div>
 * 	</cq-drawing-context>
 * </cq-dialog>
 *
 * @example <caption>Edit state attribute, value is the tool name</caption>
 * <cq-toolbar cq-drawing-edit="none"></cq-toolbar>
 *
 * @since 6.2.0
 */
function DrawingEdit(node, context) {
	var stx = context.stx;
	var $node = CIQ.UI.$(node || context.topNode);
	this.node = $node[0];
	this.context = context;
	this.editing = null;
	this.drawingContext = document.querySelector("cq-drawing-context");
	this.cvpController = $node.find("cq-cvp-controller");
	this.toolbar = $node.find("cq-toolbar");
	if (!this.toolbar.length) {
		this.toolbar = $node.find("cq-drawing-settings");
	}
	var self = this;
	Array.from(this.toolbar).forEach(function (t) {
		t.addEventListener("change", onToolbarChangeEditOrEnd(stx, self));
	});
	this.count = stx.drawingObjects.length;
	context.advertiseAs(this, "DrawingEdit");
	stx.addEventListener("drawing", onDrawingEndEdit(this));
	stx.addEventListener("drawingEdit", onDrawingEditShowContext(this));
	$node.find("cq-toolbar .ciq-drawing-edit-only").each(function (i, el) {
		if (el.querySelector(".ciq-btn")) {
			["mouseenter", "mouseleave"].forEach(function (ev) {
				el.addEventListener(ev, onButtonHoverHighlightDrawing(stx, self));
			});
		}
	});
}
CIQ.inheritsFrom(DrawingEdit, CIQ.UI.Helper);
/**
 * Listens for the "change" event from the <cq-toolbar> component.
 * Applies the new currentVectorParameters to the drawing in edit mode.
 * @param {CIQ.ChartEngine} stx
 * @param {CIQ.UI.DrawingEdit} self
 * @returns {Function}
 * @private
 */
function onToolbarChangeEditOrEnd(stx, self) {
	return function () /* onChange */ {
		if (!self.editing) return;
		if (self.editing.name !== stx.currentVectorParameters.vectorType) {
			self.endEdit(null, "tool");
			return;
		}
		self.editing.copyConfig();
		stx.draw();
		stx.changeOccurred("vector");
	};
}
/**
 * Listens for the "drawing" event from the CIQ.ChartEngine instance.
 * Ends the edit mode when a drawing is deleted.
 * @param {CIQ.UI.DrawingEdit} self
 * @returns {Function}
 * @private
 */
function onDrawingEndEdit(self) {
	return function (/* stx:onDrawing */ params) {
		var count = params.drawings.length;
		if (self.count !== count) {
			self.endEdit(null, "count");
			self.count = count;
		}
	};
}
/**
 * Listens for the "drawingEdit" event from the CIQ.ChartEngine instance.
 * When forceEdit is true, then edit mode is entered immediately, usually for touch devices.
 * Otherwise, the context menu is shown by passing the event parameters directly to {CIQ.UI.DrawingEdit#showContext}.
 * @param {CIQ.UI.DrawingEdit} self
 * @returns {Function}
 * @private
 */
function onDrawingEditShowContext(self) {
	return function (/* stx:onDrawingEdit */ params) {
		if (params.forceEdit === true) {
			self.endEdit(null, "edit");
			self.showToolbar(params.drawing);
			self.beginEdit(params.drawing);
		} else {
			self.showContext(params);
		}
	};
}
/**
 * Listens for the "mouseenter" & "mouseleave" events from the done editing button.
 * Causes the edited drawing to be highlighted on hover.
 * @param {CIQ.ChartEngine} stx
 * @param {CIQ.UI.DrawingEdit} self
 * @returns {Function}
 * @private
 */
function onButtonHoverHighlightDrawing(stx, self) {
	return function (/* onHover */ event) {
		var enter = event.type === "mouseenter";
		if (self.editing && self.editing.highlighted !== enter) {
			self.editing.highlighted = enter;
			stx.draw();
		}
	};
}
/**
 * Show the drawing context menu at the current cursor position.
 *
 * Used internally by the DrawingEdit instance.
 *
 * @memberof CIQ.UI.DrawingEdit
 * @param {Object} params Object directly from the "drawingEdit" event.
 * @param {CIQ.Drawing} params.drawing The drawing to show the dialog for.
 * @since 6.2.0
 * @private
 */
DrawingEdit.prototype.showContext = function (params) {
	params.context = this.context;
	params.x = CIQ.ChartEngine.crosshairX;
	params.y = CIQ.ChartEngine.crosshairY;
	this.count = this.context.stx.drawingObjects.length; // update to avoid race conditions
	if (this.drawingContext) {
		if (this.drawingContext.open) this.drawingContext.open(params);
	}
};
DrawingEdit.prototype.getToolActivator = function (tool) {
	var menuitem = this.toolbar.find('cq-item[cq-tool="' + tool + '"]');
	if (!menuitem.length)
		menuitem = this.toolbar.find("cq-item[stxtap=\"tool('" + tool + "')\"]");
	return {
		node: menuitem[0]
	};
};
/**
 * Update all instances of <cq-toolbar> and dispatch a showToolbar event.
 * Used internally by the DrawingEdit instance.
 *
 * @memberof CIQ.UI.DrawingEdit
 * @param {CIQ.Drawing} drawing The vector instance to sync with the toolbar.
 * @since 6.2.0
 * @private
 */
DrawingEdit.prototype.showToolbar = function (drawing) {
	var self = this;
	var activator = self.getToolActivator(drawing.name);
	var node = self.node;
	this.toolbar.each(function () {
		var lineWidth = drawing.lineWidth;
		var pattern = drawing.pattern;
		var isFib = drawing.parameters && drawing instanceof CIQ.Drawing.fibonacci;
		if (isFib) {
			lineWidth = drawing.parameters.fibs[0].parameters.lineWidth;
			pattern = drawing.parameters.fibs[0].parameters.pattern;
		}
		this.tool(activator, drawing.name);
		this.sync({
			lineWidth: lineWidth,
			pattern: pattern,
			annotation: {
				font: drawing.font ? CIQ.clone(drawing.font) : {}
			},
			fillColor: drawing.fillColor,
			currentColor: drawing.color,
			axisLabel: drawing.axisLabel
		});
		self.cvpController.each(function () {
			this.sync(drawing);
		});
		this.dirty(false);
		// tool called the drawing initializeParameters method, so we now need to override the defaults
		if (isFib) {
			this.context.stx.currentVectorParameters.fibonacci = CIQ.clone(
				drawing.parameters
			);
		}
	});
};
/**
 * Setup the given drawing for edit mode.
 * Used internally by the DrawingEdit instance.
 * @memberof CIQ.UI.DrawingEdit
 * @param {CIQ.Drawing} drawing The vector instance to synchronize with currentVectorParameters.
 * @fires CIQ.UI.DrawingEdit#drawing-edit-begin
 * @since 6.2.0
 * @private
 * @example <caption>Hide elements during edit mode</caption>
 * <cq-toolbar cq-drawing-edit="segment">
 * 	<div class="ciq-drawing-edit-hidden">This element is hidden</div>
 * </cq-toolbar>
 */
DrawingEdit.prototype.beginEdit = function (drawing) {
	// the property is enough, the editing is handled by <cq-toolbar>'s change event and the drawing copyConfig method
	this.editing = drawing;
	this.beforeEdit = drawing.serialize();
	this.toolbar.attr("cq-drawing-edit", drawing.name);
	var beginEvent = new CustomEvent("drawing-edit-begin", {
		bubbles: true,
		cancelable: true,
		detail: {
			drawing: drawing,
			tool: drawing.name
		}
	});
	/**
	 * Drawing edit begin - the start of "edit mode" for a specific drawing.
	 *
	 * @event CIQ.UI.DrawingEdit#drawing-edit-begin
	 * @type {CustomEvent}
	 * @property {CIQ.Drawing} detail.drawing object to setup for editing
	 * @property {String} detail.tool the vector type / tool name
	 * @example <caption>Open the drawing toolbar</caption>
	 * drawingEdit.node.addEventListener('drawing-edit-begin', function(event) {
	 * 	if (document.body.classList.contains('toolbar-on')) return;
	 * 	document.querySelectorAll('.ciq-draw').forEach(function(i) {
	 * 		i.priorVectorType = event.detail.tool;
	 * 		i.set(true);
	 * 	});
	 * }, false);
	 */
	this.node.dispatchEvent(beginEvent);
};
/**
 * Teardown the current edit mode.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * Used internally by the DrawingEdit instance. May also be used by the UI
 * to explicitly stop editing.
 *
 * @memberof CIQ.UI.DrawingEdit
 * @param {Object} activator not used, passed by stxtap binding
 * @param {String} action a friendly name that caused the edit mode to end
 * @fires CIQ.UI.DrawingEdit#drawing-edit-end
 * @example <caption>Button to manually end edit mode</caption>
 * <div class="ciq-drawing-edit-only" cq-section>
 * 	<div class="ciq-btn" stxtap="DrawingEdit.endEdit('close')">Done Editing</div>
 * </div>
 * @private
 * @since 6.2.0
 */
DrawingEdit.prototype.endEdit = function (activator, action) {
	var stx = this.context.stx;
	var endEvent = null;
	var toolName = null;
	if (this.editing) {
		toolName = this.editing.name;
		endEvent = new CustomEvent("drawing-edit-end", {
			bubbles: true,
			cancelable: true,
			detail: {
				action: action,
				drawing: this.editing,
				tool: toolName
			}
		});
		var index = stx.drawingObjects.indexOf(this.editing);
		var before = stx.exportDrawings();
		if (index > -1 && this.beforeEdit) {
			before[index] = this.beforeEdit;
			stx.undoStamp(before, stx.exportDrawings());
		}
		if (action === "close" && this.editing.highlighted) {
			this.editing.highlighted = false;
			stx.draw();
		}
	}
	this.editing = null;
	this.beforeEdit = null;
	this.toolbar.attr("cq-drawing-edit", "none");
	if (action === "close") {
		// display the saved parameters if they exist in localStorage
		if (toolName) {
			activator = this.getToolActivator(toolName);
			this.toolbar.each(function () {
				this.tool(activator, toolName);
			});
		}
		stx.changeVectorType(toolName);
	}
	if (endEvent) {
		/**
		 * Drawing edit end - signals the end of "edit mode" to allow for additional teardown.
		 *
		 * @event CIQ.UI.DrawingEdit#drawing-edit-end
		 * @type {CustomEvent}
		 * @property {String} detail.action value is the method or description that caused editing teardown
		 * @property {CIQ.Drawing} detail.drawing object to teardown from editing
		 * @property {String} detail.tool the vector type / tool name
		 * @example <caption>Close the drawing toolbar</caption>
		 * drawingEdit.node.addEventListener('drawing-edit-end', function(event) {
		 * 	if (event.detail.action === 'close') {
		 * 		document.querySelectorAll('.ciq-draw').forEach(function(i) {
		 * 			i.set(false);
		 * 		});
		 * 	}
		 * }, false);
		 */
		this.node.dispatchEvent(endEvent);
	}
};
/**
 * Drawing context menu edit settings option.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 *
 * @memberof CIQ.UI.DrawingEdit
 * @since 6.2.0
 */
DrawingEdit.prototype.edit = function () {
	var self = this;
	if (this.drawingContext) {
		var drawing = this.drawingContext.drawing;
		// Get the closest context in case there is more than one on the page
		var localContext = CIQ.UI.getMyContext(drawing.stx.container).topNode;
		// The drawing context menu element is created outside of any instant chart so query the document
		var contextContainer = document.querySelector("cq-drawing-context")
			.parentNode;
		var settingsPalette = localContext.querySelector("cq-drawing-settings");
		var contextLocation = {
			left: contextContainer.offsetLeft,
			top: contextContainer.offsetTop
		};
		this.drawingContext.close();
		self.endEdit(null, "edit");
		self.showToolbar(drawing, contextLocation);
		self.beginEdit(drawing);
		// Check for the settings palette here because this method may be called by the legacy toolbar
		// Also do not detach the palette when at the small screen breakpoints
		if (
			settingsPalette &&
			!/break.*sm\b/.test(self.context.topNode.className)
		) {
			settingsPalette.detach(contextLocation.left, contextLocation.top);
		}
	}
};
/**
 * Drawing context menu edit text option.
 *
 * Used for drawing tools with an edit() function, such as annotation and callout.
 *
 * Will allow re-application of this function.
 *
 * @memberof CIQ.UI.DrawingEdit
 * @since 7.0.0
 */
DrawingEdit.prototype.text = function () {
	var self = this;
	if (this.drawingContext) {
		this.drawingContext.close();
		self.endEdit(null, "text");
		if (this.drawingContext.drawing.edit)
			this.drawingContext.drawing.edit(null, true);
	}
};
/**
 * Drawing context menu clone option.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @memberof CIQ.UI.DrawingEdit
 * @since 6.2.0
 */
DrawingEdit.prototype.clone = function () {
	var self = this;
	var stx = this.context.stx;
	this.endEdit(null, "clone");
	if (this.drawingContext) {
		this.drawingContext.close();
		var drawing = this.drawingContext.drawing;
		var clone = new CIQ.Drawing[drawing.name]();
		var dehydrate = drawing.serialize();
		clone.reconstruct(stx, dehydrate);
		clone.repositioner = drawing.repositioner;
		clone.highlighted = true;
		drawing.highlighted = false;
		self.count += 1;
		stx.addDrawing(clone);
		stx.activateRepositioning(clone);
	}
};
/**
 * Change the order of the drawingObjects array, which determines the layering of drawings.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @param {Object} activator
 * @param {String} layer the action to apply to the current drawing. May be "up", "down", "top", or "bottom"
 * @memberof CIQ.UI.DrawingEdit
 * @since 6.2.0
 */
DrawingEdit.prototype.reorderLayer = function (activator, layer) {
	var self = this;
	var stx = this.context.stx;
	this.endEdit(null, "reorderLayer");
	if (this.drawingContext) {
		this.drawingContext.close();
		var lastIndex = stx.drawingObjects.length - 1;
		var removeIndex = stx.drawingObjects.indexOf(this.drawingContext.drawing);
		var insertIndex = NaN;
		if (removeIndex === -1) return;
		switch (layer) {
			case "up":
				if (removeIndex < lastIndex) {
					insertIndex = removeIndex + 1;
				}
				break;
			case "down":
				if (removeIndex > 0) {
					insertIndex = removeIndex - 1;
				}
				break;
			case "top":
				if (removeIndex < lastIndex) {
					insertIndex = lastIndex;
				}
				break;
			case "bottom":
				if (removeIndex > 0) {
					insertIndex = 0;
				}
				break;
		}
		if (insertIndex !== insertIndex) return; // NaN check
		var before = stx.exportDrawings();
		stx.drawingObjects.splice(removeIndex, 1);
		stx.drawingObjects.splice(insertIndex, 0, this.drawingContext.drawing);
		stx.undoStamp(before, stx.exportDrawings());
		stx.draw();
		stx.changeOccurred("vector");
	}
};
/**
 * Drawing context menu remove/delete option.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @memberof CIQ.UI.DrawingEdit
 * @since 6.2.0
 */
DrawingEdit.prototype.remove = function () {
	var self = this;
	var stx = this.context.stx;
	this.endEdit(null, "remove");
	if (this.drawingContext) {
		if (this.drawingContext.drawing.permanent) return;
		var before = stx.exportDrawings();
		self.count -= 1;
		stx.removeDrawing(this.drawingContext.drawing);
		stx.undoStamp(before, stx.exportDrawings());
		this.drawingContext.close();
	}
};
/**
 * UI Helper for managing study interaction, editing, deleting, and so forth.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * Requires the [cq-study-dialog]{@link WebComponents.cq-study-dialog} web component.
 *
 * Sets up a [studyOverlayEditEventListener]{@link CIQ.ChartEngine~studyOverlayEditEventListener}
 * to display a context menu for editing or deleting overlays and a
 * [studyPanelEditEventListener]{@link CIQ.ChartEngine~studyPanelEditEventListener} to display a
 * dialog for editing study parameters.
 *
 * @param {HTMLElement} [node=context.topNode] Automatically attaches to the top node of the
 * 		context.
 * @param {CIQ.UI.Context} context The context for the chart.
 *
 * @name CIQ.UI.StudyEdit
 * @constructor
 * @since 4.1.0 The `contextDialog` parameter is no longer passed in.
 */
CIQ.UI.StudyEdit = function (node, context) {
	this.context = context;
	this.node = node ? node : context.topNode;
	this.contextDialog = [];
	var sc = document.querySelectorAll("cq-study-context");
	for (var i = 0; i < sc.length; i++) {
		this.contextDialog.push(sc[i]);
	}
	context.advertiseAs(this, "StudyEdit");
	this.initialize();
};
CIQ.inheritsFrom(CIQ.UI.StudyEdit, CIQ.UI.Helper);
/**
 * Closes Study Edit dialog.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @memberof CIQ.UI.StudyEdit
 */
CIQ.UI.StudyEdit.prototype.remove = function () {
	CIQ.Studies.removeStudy(this.params.stx, this.params.sd);
	this.contextDialog.forEach(function (studyContext) {
		if (studyContext.close) studyContext.close();
	});
};
/**
 * Proxy for editing a study.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * Assumes the params for the study have already been set.
 * @memberof CIQ.UI.StudyEdit
 */
CIQ.UI.StudyEdit.prototype.edit = function () {
	this.contextDialog.forEach(function (studyContext) {
		if (studyContext.close) studyContext.close();
	});
	this.editPanel(this.params);
};
/**
 * Finds the [cq-study-dialog]{@link WebComponents.cq-study-dialog} web component and proxies
 * the parameters over to it.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @memberof CIQ.UI.StudyEdit
 * @param {object} params Parameters from the
 * 		[studyPanelEditEventListener]{@link CIQ.ChartEngine~studyPanelEditEventListener}.
 */
CIQ.UI.StudyEdit.prototype.editPanel = function (params) {
	const { stx, config } = this.context;
	params.context = this.context;
	// Make sure we don't open the dialog in the context menu position
	params.x = null;
	params.y = null;
	const { channelWrite } = CIQ.UI.BaseComponent.prototype;
	if (config) {
		const channel = (config.channels || {}).dialog || "channel.dialog";
		channelWrite(channel, { type: "study", params }, stx);
	} else {
		document.querySelector("cq-study-dialog").open(params);
	}
};
/**
 * Displays the Edit Settings, Delete Study context dialog for overlay studies and
 * prepares the parameters for editing.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * @memberof CIQ.UI.StudyEdit
 * @param {object} params Parameters from the
 * 		[studyOverlayEditEventListener]{@link CIQ.ChartEngine~studyOverlayEditEventListener}.
 */
CIQ.UI.StudyEdit.prototype.editOverlay = function (params) {
	this.params = params;
	params.context = this.context;
	if (params.forceEdit) {
		this.editPanel(params);
	} else {
		this.contextDialog.forEach(function (studyContext) {
			params.x = CIQ.ChartEngine.crosshairX;
			params.y = CIQ.ChartEngine.crosshairY;
			if (studyContext.open) studyContext.open(params);
		});
	}
};
/**
 * Creates the callbacks for self and the context.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @memberof CIQ.UI.StudyEdit
 */
CIQ.UI.StudyEdit.prototype.initialize = function () {
	var stx = this.context.stx;
	var self = this;
	function closure(fc) {
		return function () {
			fc.apply(self, arguments);
		};
	}
	stx.addEventListener("studyOverlayEdit", closure(self.editOverlay));
	stx.addEventListener("studyPanelEdit", closure(self.editPanel));
};
/**
 * UI Helper for Layout changes, for instance tapping items on the display menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * This Helper is also responsible for initializing menu items in the "display" menu based on the <a href="CIQ.ChartEngine.html#layout%5B%60chartType%60%5D">chart layout</a>
 *
 * It can be extended to manage other layout events. For example, assuming the following HTML:
 * ```
 * <cq-heading>Defaults</cq-heading>
 * <cq-item stxtap="Layout.doStuff('thing1')">Do this thing</cq-item>
 * <cq-item stxtap="Layout.doStuff('thing2')">Do this other thing</cq-item>
 * <cq-separator></cq-separator>
 * ```
 *  * You would need the following corresponding function:
 * ```
 * CIQ.UI.Layout.prototype.doStuff=function(node,whatToDo){
 *     var stx=this.context.stx;
 *     alert(whatToDo);
 * };
 * ```
 * where the first parameter is always the node that was clicked, and can be manipulated to change as needed to add or remove styling, for example.
 * @name CIQ.UI.Layout
 * @param {CIQ.UI.Context} context The context
 * @param {Object} [params] Parameters
 * @param {String} [params.activeClassName="ciq-active"] The class name to be added to a node when a layout item is enabled
 * @constructor
 * @since 4.1.0 Layout no longer takes a node as its first parameter
 */
CIQ.UI.Layout = function (context, params) {
	this.params = params ? params : {};
	if (!this.params.activeClassName) this.params.activeClassName = "ciq-active";
	this.context = context;
	context.advertiseAs(this, "Layout");
};
CIQ.inheritsFrom(CIQ.UI.Layout, CIQ.UI.Helper);
/**
 * Activates the chart style or aggregation type radio button on the Display drop-down menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * @param {HTMLElement} node The user interface element that enables users to select a chart
 * 		style or aggregation type.
 * @param {String} chartType The chart style or aggregation type of the activated radio button.
 *
 * @memberof CIQ.UI.Layout
 * @private
 */
CIQ.UI.Layout.prototype.getChartType = function (node, chartType) {
	var stx = this.context.stx,
		className = this.params.activeClassName;
	var listener = function (obj) {
		var layout = obj.obj;
		if (layout.aggregationType && layout.aggregationType != "ohlc") {
			if (chartType !== layout.aggregationType) {
				node.classList.remove(className);
			} else {
				node.classList.add(className);
			}
		} else {
			if (chartType !== layout.chartType) {
				node.classList.remove(className);
			} else {
				node.classList.add(className);
			}
		}
	};
	CIQ.UI.observeProperty("chartType", stx.layout, listener);
	CIQ.UI.observeProperty("aggregationType", stx.layout, listener);
};
/**
 * Convenience function to set the chart style or aggregation type from the Display drop-down
 * menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * Leverages {@link CIQ.ChartEngine#setChartType} and
 * {@link CIQ.ChartEngine#setAggregationType}.
 *
 * @param {HTMLElement} [node] The user interface element that enables users to set the chart
 * 		style or aggregation type.
 * @param {String} chartType The chart style or aggregation type to be set.
 *
 * @memberof CIQ.UI.Layout
 */
CIQ.UI.Layout.prototype.setChartType = function (node, chartType) {
	var aggregations = {
		heikinashi: true,
		kagi: true,
		linebreak: true,
		pandf: true,
		rangebars: true,
		renko: true
	};
	if (aggregations[chartType]) {
		this.context.stx.setAggregationType(chartType);
	} else {
		this.context.stx.setChartType(chartType);
	}
};
/**
 * Activates the chart scaling control on the Display drop-down menu.
 *
 * @param {HTMLElement} node The user interface element that enables users to enable and
 * 		disable the log scale.
 * @param {String} chartScale The type of scaling, such as "log", "linear", "percent", or
 * 		"relative".
 *
 * @memberof CIQ.UI.Layout
 * @private
 */
CIQ.UI.Layout.prototype.getChartScale = function (node, chartScale) {
	var stx = this.context.stx,
		className = this.params.activeClassName;
	var listener = function (obj) {
		if (obj.value == chartScale) node.classList.add(className);
		else node.classList.remove(className);
	};
	CIQ.UI.observeProperty("chartScale", stx.layout, listener);
};
/**
 * Convenience function to set the chart scale from the Display drop-down menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * Leverages {@link CIQ.ChartEngine#setChartScale}.
 *
 * @param {HTMLElement} [node] The user interface element that enables users to set the chart
 * 		scale.
 * @param {String} chartScale The type of scaling, such as "log", "linear", "percent", or
 * 		"relative".
 *
 * @memberof CIQ.UI.Layout
 */
CIQ.UI.Layout.prototype.setChartScale = function (node, chartScale) {
	var stx = this.context.stx;
	var layoutScale = stx.layout.chartScale;
	if (layoutScale == chartScale) {
		stx.setChartScale(null);
	} else if (!layoutScale || layoutScale == "linear") {
		stx.setChartScale(chartScale);
	}
};
/**
 * Activates the invert y-axis control on the Display drop-down menu.
 *
 * @param {HTMLElement} node The user interface element that enables users to enable and
 * 		disable the flipped chart option.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 6.3.0
 */
CIQ.UI.Layout.prototype.getFlippedChart = function (node) {
	var stx = this.context.stx,
		className = this.params.activeClassName;
	var listener = function (obj) {
		if (obj.value) node.classList.add(className);
		else node.classList.remove(className);
	};
	CIQ.UI.observeProperty("flipped", stx.layout, listener);
};
/**
 * Convenience function to set the inverted y-axis mode from the Display drop-down menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * Leverages {@link CIQ.ChartEngine#flipChart}.
 *
 * @param {HTMLElement} [node] The user interface element that enables users to flip the chart.
 *
 * @memberof CIQ.UI.Layout
 * @since 6.3.0
 */
CIQ.UI.Layout.prototype.setFlippedChart = function (node) {
	var stx = this.context.stx;
	stx.flipChart(!stx.layout.flipped);
};
/**
 * Activates the extended hours control on the Display drop-down menu.
 *
 * @param {HTMLElement} node The user interface element that enables users to enable and
 * 		disable extended hours.
 *
 * @memberof CIQ.UI.Layout
 * @private
 */
CIQ.UI.Layout.prototype.getExtendedHours = function (node) {
	var stx = this.context.stx,
		className = this.params.activeClassName;
	var listener = function (obj) {
		if (obj.value) node.classList.add(className);
		else node.classList.remove(className);
	};
	CIQ.UI.observeProperty("extended", stx.layout, listener);
};
/**
 * Convenience function to set extended hours mode from the Display drop-down menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * See {@link CIQ.Market} and {@link CIQ.ExtendedHours}.
 *
 * @param {HTMLElement} [node] The user interface element that enables users to enable and
 * 		disable extended hours.
 *
 * @memberof CIQ.UI.Layout
 */
CIQ.UI.Layout.prototype.setExtendedHours = function (node) {
	var stx = this.context.stx;
	stx.layout.extended = !stx.layout.extended;
	stx.changeOccurred("layout");
	// check if extended hours exists for this security
	if (
		stx.layout.extended &&
		!(stx.chart.market.market_def && stx.chart.market.sessions.length)
	) {
		CIQ.alert("There are no Extended Hours for this instrument.");
	}
	if (stx.extendedHours) {
		var loader = this.context.loader;
		if (loader) loader.show();
		stx.extendedHours.set(stx.layout.extended, null, function () {
			if (loader) loader.hide();
		});
	}
};
/**
 * Activates the range selector control on the Display drop-down menu.
 *
 * @param {HTMLElement} node The user interface element that enables users to enable and
 * 		disable the range slider.
 *
 * @memberof CIQ.UI.Layout
 * @private
 */
CIQ.UI.Layout.prototype.getRangeSlider = function (node) {
	var stx = this.context.stx,
		className = this.params.activeClassName;
	var listener = function (obj) {
		if (obj.value) node.classList.add(className);
		else node.classList.remove(className);
	};
	CIQ.UI.observeProperty("rangeSlider", stx.layout, listener);
};
/**
 * Convenience function to toggle the range slider mode from the Display drop-down menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * See {@link CIQ.RangeSlider}.
 *
 * @param {HTMLElement} [node] The user interface element that enables users to enable and
 * 		disable the range slider.
 *
 * @memberof CIQ.UI.Layout
 */
CIQ.UI.Layout.prototype.setRangeSlider = function (node) {
	var stx = this.context.stx;
	stx.layout.rangeSlider = !stx.layout.rangeSlider;
	if (stx.slider) stx.slider.display(stx.layout.rangeSlider);
	stx.changeOccurred("layout");
};
/**
 * Activates the Display menu user interface element that shows and hides outliers.
 *
 * @param {HTMLElement} node The user interface element that enables users to show and hide
 * 		outliers.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since
 * - 7.5.0
 * - 8.0.0 Changed access to private.
 */
CIQ.UI.Layout.prototype.getOutliers = function (node) {
	var stx = this.context.stx,
		className = this.params.activeClassName;
	var listener = function (obj) {
		if (obj.value) node.classList.add(className);
		else node.classList.remove(className);
	};
	CIQ.UI.observeProperty("outliers", stx.layout, listener);
};
/**
 * Convenience function that toggles the outliers layout property between on and off (true
 * and false). Invoked from the Display drop-down menu.
 *
 * @param {HTMLElement} [node] The user interface element that enables users to show and hide
 * 		outliers.
 *
 * @memberof CIQ.UI.Layout
 * @since 7.5.0
 */
CIQ.UI.Layout.prototype.setOutliers = function (node) {
	var stx = this.context.stx;
	stx.layout.outliers = !stx.layout.outliers;
	stx.draw();
	stx.changeOccurred("layout");
};
/**
 * Activates the chart aggregation type radio button on the Display drop-down menu.
 *
 * @param {HTMLElement} node The user interface element that enables users to select the
 * 		aggregation type.
 * @param {String} aggregationType Identifies the aggregation type.
 *
 * @memberof CIQ.UI.Layout
 * @private
 */
CIQ.UI.Layout.prototype.getAggregationType = function (node, aggregationType) {
	var stx = this.context.stx,
		className = this.params.activeClassName;
	var listener = function (obj) {
		if (obj.value == aggregationType) node.classList.add(className);
		else node.classList.remove(className);
	};
	CIQ.UI.observeProperty("aggregationType", stx.layout, listener);
};
/**
 * Convenience function to set the aggregation type from the Display drop-down menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * Leverages {@link CIQ.ChartEngine#setAggregationType}.
 *
 * @param {HTMLElement} [node] The user interface element that enables users to set the
 * 		aggregation type.
 * @param {string} aggregationType The aggregation type to be set.
 *
 * @memberof CIQ.UI.Layout
 */
CIQ.UI.Layout.prototype.setAggregationType = function (node, aggregationType) {
	if (this.context.stx.layout.aggregationType == aggregationType) {
		this.context.stx.setAggregationType(null);
	} else {
		this.context.stx.setAggregationType(aggregationType);
	}
};
/**
 * Activates the edit control on the Display drop-down menu for the aggregation type
 * identified by `field`.
 *
 * @param {HTMLElement} node The user interface element that enables users to edit the
 * 		aggregation settings.
 * @param {String} field Identifies the aggregation type to which the edit control applies.
 *
 * @memberof CIQ.UI.Layout
 * @private
 */
CIQ.UI.Layout.prototype.getAggregationEdit = function (node, field) {
	var stx = this.context.stx;
	var tuple = CIQ.deriveFromObjectChain(stx.layout, field);
	var listener = function (obj) {
		var value = obj.value;
		if (!value && stx.chart.defaultChartStyleConfig[node.name]) {
			node.value = stx.chart.defaultChartStyleConfig[node.name];
		} else {
			node.value = value;
		}
	};
	CIQ.UI.observeProperty(tuple.member, tuple.obj, listener);
};
/**
 * Updates settings for the aggregation type specified by `field`.
 *
 * @param {HTMLElement} node The user interface element that enables users to edit the
 * 		aggregation settings.
 * @param {String} field Identifies the aggregation type to which the settings apply.
 *
 * @memberof CIQ.UI.Layout
 * @private
 */
CIQ.UI.Layout.prototype.setAggregationEdit = function (node, field) {
	var stx = this.context.stx;
	function completeAggEdit() {
		stx.changeOccurred("layout");
		stx.createDataSet();
		stx.draw();
	}
	if (field === "auto") {
		if (stx.layout.aggregationType === "kagi") {
			stx.layout.kagi = null;
		} else if (stx.layout.aggregationType === "renko") {
			stx.layout.renko = null;
		} else if (stx.layout.aggregationType === "linebreak") {
			stx.layout.priceLines = null;
		} else if (stx.layout.aggregationType === "rangebars") {
			stx.layout.rangebars = null;
		} else if (stx.layout.aggregationType === "pandf") {
			if (!stx.layout.pandf) {
				stx.layout.pandf = { box: null, reversal: null };
			}
			stx.layout.pandf.box = null;
			stx.layout.pandf.reversal = null;
		}
		completeAggEdit();
		const parent = node.params.parent;
		if (!parent) return;
		Array.from(
			parent.querySelectorAll(".ciq" + stx.layout.aggregationType + " input")
		).forEach(function (input) {
			var name = input.name;
			if (name == "box" || name == "reversal") name = "pandf." + name;
			var tuple = CIQ.deriveFromObjectChain(stx.layout, name);
			if (
				tuple &&
				!tuple.obj[tuple.member] &&
				stx.chart.defaultChartStyleConfig[input.name]
			)
				input.value = stx.chart.defaultChartStyleConfig[input.name];
		});
	} else {
		var tuple = CIQ.deriveFromObjectChain(stx.layout, field);
		tuple.obj[tuple.member] = node.node.value;
		completeAggEdit();
	}
};
/**
 * @memberof CIQ.UI.Layout
 * @param {HTMLElement} [node]
 * @param {String} aggregationType
 * @private
 */
CIQ.UI.Layout.prototype.showAggregationEdit = function (node, aggregationType) {
	const { context } = this;
	if (context.config) {
		const { channelWrite } = CIQ.UI.BaseComponent.prototype;
		const channel = (context.config.channels || {}).dialog || "channel.dialog";
		channelWrite(
			channel,
			{ type: "aggregation", params: { context, aggregationType } },
			context.stx
		);
	} else {
		// configuration not available reverting to legacy dialog opening
		const dialog = document.querySelector("cq-aggregation-dialog");
		dialog.open({ context: this.context, aggregationType: aggregationType });
	}
};
/**
 * Removes all studies from the top most node.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @memberof CIQ.UI.Layout
 * @param {HTMLElement} [node] The HTML user interface element used to clear all studies from the chart.
 */
CIQ.UI.Layout.prototype.clearStudies = function (node) {
	if (!CIQ.Studies) return;
	var stx = this.context.stx;
	for (var id in stx.layout.studies) {
		var sd = stx.layout.studies[id];
		if (!sd.customLegend && !sd.permanent) CIQ.Studies.removeStudy(stx, sd);
	}
	stx.draw();
};
/**
 * Convenience function to set periodicity from the drop-down menu.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * Leverages {@link CIQ.ChartEngine#setPeriodicity}.
 * @param {HTMLElement} [node] The user interface element that enables users to set periodicity.
 * @param {number} periodicity Same as `period` from {@link CIQ.ChartEngine#setPeriodicity}.
 * @param {number} interval Same as `interval` from {@link CIQ.ChartEngine#setPeriodicity}.
 * @param {number} timeUnit Same as `timeUnit` from {@link CIQ.ChartEngine#setPeriodicity}.
 *
 * @memberof CIQ.UI.Layout
 */
CIQ.UI.Layout.prototype.setPeriodicity = function (
	node,
	periodicity,
	interval,
	timeUnit
) {
	var self = this;
	if (self.context.loader) self.context.loader.show();
	self.context.stx.setPeriodicity(
		{ period: periodicity, interval: interval, timeUnit: timeUnit },
		function () {
			if (self.context.loader) self.context.loader.hide();
		}
	);
};
/**
 * Sets the display periodicity.
 *
 * Usually this is called from an observer that is in {@link CIQ.UI.Layout#periodicity}
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @param  {CIQ.ChartEngine} stx    The chart object to examine for periodicity
 * @param  {Object} params Parameters
 * @param {HTMLElement} params.selector The selector to update
 * @memberof CIQ.UI.Layout
 */
CIQ.UI.Layout.prototype.showPeriodicity = function (stx, params) {
	var text = "";
	var { period, interval, timeUnit } = stx.getPeriodicity();
	period *= interval;
	text = period;
	if (timeUnit == "day") {
		text += "D";
	} else if (timeUnit == "week") {
		text += "W";
	} else if (timeUnit == "month") {
		text += "M";
	} else if (timeUnit == "second") {
		text += "s";
	} else if (timeUnit == "millisecond") {
		text += "ms";
	} else if (period >= 60 && period % 15 === 0) {
		text = period / 60 + "H";
	} else if (timeUnit == "tick") {
		text = (period > 1 ? period : "") + "T";
	} else {
		text += "m";
	}
	params.selector.innerHTML = "";
	params.selector.appendChild(CIQ.translatableTextNode(stx, text));
};
CIQ.UI.Layout.prototype.periodicity = function (node) {
	var self = this,
		stx = this.context.stx;
	var listener = function (obj) {
		self.showPeriodicity(stx, { selector: node });
	};
	CIQ.UI.observeProperty("interval", stx.layout, listener);
	CIQ.UI.observeProperty("periodicity", stx.layout, listener);
	CIQ.UI.observeProperty("timeUnit", stx.layout, listener);
};
/**
 * Populates and displays the language widget.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial on how to work with and customize the web components can be found here: {@tutorial Web Component Interface}
 *
 * @memberof CIQ.UI.Layout
 */
CIQ.UI.Layout.prototype.setLanguage = function () {
	const { config, stx } = this.context;
	if (config) {
		const { channelWrite } = CIQ.UI.BaseComponent.prototype;
		const channel = (config.channels || {}).dialog || "channel.dialog";
		const params = { context: stx.uiContext };
		channelWrite(channel, { type: "language", params }, stx);
	} else {
		// config is not available revert to direct component access
		document.querySelector("cq-language-dialog").open();
	}
};
/**
 * Displays the current language in the language widget.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full
 * tutorial on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}
 *
 * @param {HTMLElement} node The user interface element that enables users to select the chart
 * 		language.
 *
 * @memberof CIQ.UI.Layout
 * @since 6.1.0 Defaults to English.
 */
CIQ.UI.Layout.prototype.getLanguage = function (node) {
	var stx = this.context.stx;
	var listener = function (obj) {
		if (!CIQ.I18N.languages) CIQ.I18N.languages = { en: "English" };
		var lang = node.querySelector("cq-language-name");
		if (lang) {
			lang.innerText = CIQ.I18N.languages[CIQ.I18N.language];
			var flag = node.querySelector("cq-flag");
			if (flag) flag.setAttribute("cq-lang", CIQ.I18N.language);
		}
	};
	CIQ.UI.observeProperty("language", CIQ.I18N, listener);
};
/**
 * UI Helper for managing the 'Events' menu drop down for showing markers on the chart.
 *
 * @name CIQ.UI.Markers
 * @param {CIQ.UI.Context} context The context
 * @param {Object} params initialization parameters
 * @param {String} params.menuItemSelector The selector used to identify menu items for selecting markers
 * @param {String} [params.activeClassName="ciq-active"] The class name to be added to a node when a layout item is enabled
 * @param {Object} [params.implementation] A class for showing markers which implements the `showMarkers` method
 * @constructor
 * @since 7.1.0
 */
CIQ.UI.Markers = function (context, params) {
	this.context = context;
	if (!params) params = {};
	this.menuItemSelector = params.menuItemSelector;
	this.activeClassName = params.activeClassName || "ciq-active";
	this.implementation = params.implementation;
	context.advertiseAs(this, "Markers");
};
CIQ.inheritsFrom(CIQ.UI.Markers, CIQ.UI.Helper);
/**
 * Displays the markers specified by the `type` parameter. If `type` is not provided, all
 * currently displayed markers are removed. Must be called from a menu item.
 *
 * To use this function:
 *
 * 1. Create an implementation that provides the methods for managing markers.
 *
 *    The marker implementation must include a `showMarkers` function that accepts the following
 *    parameters:
 *    - `type` &mdash; Categorizes the marker as a circle, square, or specialized type such as
 *      trade or video.
 *    - `renderType` &mdash; Specifies the marker class, either [Simple]{@link CIQ.Marker.Simple} or
 *      [Performance]{@link CIQ.Marker.Performance}.
 *
 *    See the `MarkersSample` class in the *markersSample.js* file in the *examples/markers*
 *    folder of your library for a complete example implementation.
 *
 * 2. Assign the implementation to the `eventMarkersImplementation` property of the chart
 *    configuration object.
 *
 *    For example, from the *sample-template-advanced.html* template (in the *examples/templates*
 *    folder of your library):
 *    ```
 *    import marker from "./examples/markers/markersSample.js";
 *
 *    const config = getDefaultConfig({
 *        markerSample: marker.MarkersSample,
 *        .
 *        .
 *        .
 *    });
 *    ```
 *
 *    The `markerSample` parameter is assigned to the `eventMarkersImplementation` property of the
 *    chart configuration object.
 *
 *    See the <a href="tutorial-Chart%20Configuration.html" target="_blank">Chart Configuration</a>
 *    tutorial for more information.
 *
 * @param {HTMLElement} node
 * @param {string} type Marker type: "circle", "square", or "callout".
 * @param {string} markerType Class of marker to draw: "Simple" or "Performance".
 *
 * @memberof CIQ.UI.Markers
 * @since 7.1.0 Added `markerType`.
 *
 * @example
 * <cq-item stxtap="Markers.showMarkers('square')">
 *     Simple Square<span class="ciq-radio"><span></span></span>
 * </cq-item>
 */
CIQ.UI.Markers.prototype.showMarkers = function (node, type, markerType) {
	var activeClassName = this.activeClassName;
	var topNode = this.context.topNode;
	var implementation = this.implementation;
	if (!implementation) {
		return;
	}
	// hide markers
	implementation.showMarkers();
	if (type) {
		implementation.showMarkers(type, markerType);
	}
	Array.from(topNode.querySelectorAll(this.menuItemSelector)).forEach(function (
		item
	) {
		// Previously event markers were one for all. Click one and the rest disappeared. Life Cycle Events breaks that chain
		// and can have as many as you want on the screen. So leave whichever have checkboxes alone.
		var hasCheckbox = item.querySelector(".ciq-checkbox");
		if (node.node == item) {
			item.classList.add(activeClassName);
		} else if (!hasCheckbox) {
			item.classList.remove(activeClassName);
		}
	});
};
/**
 * UI Helper for capturing and handling keystrokes. cb to capture the key.
 *
 * Developer is responsible for calling e.preventDefault() and/or e.stopPropagation();
 *
 * @name CIQ.UI.Keystroke
 * @param {function} [cb] Callback when key pressed
 * @param {object} [params]
 * @param {array} [params.keysToRepeat] Keys to process multiple times if key is held down
 * @constructor
 */
CIQ.UI.Keystroke = function (cb, { keysToRepeat = [] } = {}) {
	this.cb = cb;
	this.shift = false;
	this.ctrl = false;
	this.cmd = false;
	this.alt = false;
	this.capsLock = false;
	this.downValue = ""; // Android Chrome bug requires a workaround for keyup.
	this.keysToRepeat = keysToRepeat;
	this.recentKeys = {};
	this.commandKeys = {}; // all `KeyboardEvent.code` values that map to a command
	this.initialize();
};
/**
 * Set this to true to bypass key capture. Shift, CTRL, CMD will still be toggled however.
 *
 * @memberof CIQ.UI.Keystroke
 * @type {Boolean}
 */
CIQ.UI.Keystroke.noKeyCapture = false;
// http://stackoverflow.com/questions/30743490/capture-keys-typed-on-android-virtual-keyboard-using-javascript
// On Chrome Android, the keydown/keyup events are broken. We have to figure out the key that was pressed by
// examining the value of an input box before (keydown) and after (keyup) and identifying what changed
// Note that CIQ.isAndroid is false when the user requests "desktop site" and so some input boxes won't work
// in that situation. There is no workaround other than to always treat 229 as a false value (it is a swedish character)
CIQ.UI.Keystroke.prototype.androidWorkaroundKeyup = function (e) {
	var newValue = e.target.value;
	var key;
	if (newValue.length > this.downValue.length) {
		key = newValue.charAt(newValue.length - 1);
	} else {
		key = "Delete";
	}
	this.key = key;
	this.cb({ key: key, e: e, keystroke: this });
};
/**
 * Map command key values from keyboard to their internal values.
 *
 * Note: `ctrl` and `cmd` should only be used with care as they may conflict with browser and OS hotkeys.
 *
 * @memberof CIQ.UI.Keystroke
 * @param {string} key
 * @returns {string}
 */
CIQ.UI.Keystroke.prototype.mapKey = function (key) {
	const keyMapping = {
		Shift: "shift",
		Control: "ctrl",
		Alt: "alt",
		Meta: "cmd",
		Win: "cmd"
	};
	return keyMapping[key] || key;
};
// Managing keystroke events. We will get three key events from the browser: keydown, keyup, keypress
// These come in a specific order: http://www.quirksmode.org/dom/events/keys.html
// keypress gives you the capitalized or uncapitalized key, unlike keyup/keydown
// which only give you the actual physical key that was pressed on the keyboard
// keypress is triggered *before* the action modifies the input field
//
// We can capture keystrokes on the body, or on an input field. What we want to make sure is that
// the input field is actually updated when we process the stroke. Since keypress and keydown occur
// before the input field is updated, we save any key that has been handled by these in this.key
// but we don't process the stroke until the keyup event is fired. This ensures that our handlers
// will always have the right key (capitalized) and that input field value will be up to date.
CIQ.UI.Keystroke.prototype.keyup = function (e) {
	if (this.implementAndroidWorkaround) {
		this.androidWorkaroundKeyup(e);
		this.implementAndroidWorkaround = false;
		return;
	}
	const { recentKeys } = this;
	const { key, code } = e;
	const mappedKey = this.mapKey(key);
	const isCommandKey = key !== mappedKey;
	const currentTime = new Date().getTime();
	if (!recentKeys[code]) recentKeys[code] = {};
	recentKeys[code].keyup = currentTime;
	if (isCommandKey) {
		this.commandKeys[code].pressed = false;
		if (
			!Object.values(this.commandKeys).some(
				({ command, pressed }) => pressed && command === mappedKey
			)
		) {
			// only set to false if no other keys with the same command are currently pressed
			this[mappedKey] = false;
		}
		return this.cb({ key, e, keystroke: this });
	}
	// Ensure the key combinations are registered even if the command key is released slightly before
	// the combination key. A command key is still considered "live" if the current key was pressed between
	// the command key's down and up and the command key was pressed no more than 500 ms ago. Note: this
	// will not work for keys in `keysToRepeat` due to them being handled in `keydown`.
	let liveCommandKeys = [];
	Object.entries(this.commandKeys).forEach(([commandKey, { command }]) => {
		let recentCommand = recentKeys[commandKey] || {};
		let recentKey = recentKeys[code] || {};
		if (
			recentCommand.keydown < recentKey.keydown &&
			recentKey.keydown < recentCommand.keyup &&
			recentCommand.keyup + 500 > currentTime
		) {
			liveCommandKeys.push(commandKey);
			this[command] = true;
		}
	});
	// Reset command key values on next tick (as soon as current processing has completed)
	if (liveCommandKeys.length) {
		setTimeout(() => {
			liveCommandKeys.forEach((commandKey) => {
				if (recentKeys[commandKey].keydown < currentTime) {
					this[this.commandKeys[commandKey].command] = false;
				}
			});
		});
	}
	// This is where we handle the keystroke, regardless of whether we captured the key with a down or press event
	// The exception to this are the `keysToRepeat` (arrow keys, etc), which are processed in keydown
	if (!this.keysToRepeat.includes(key)) {
		this.key = key;
		this.cb({ key, e, keystroke: this });
	} else {
		this.key = null;
	}
};
CIQ.UI.Keystroke.prototype.keydown = function (e) {
	if (this.noKeyCapture) return;
	if (e.which == 229 && CIQ.isAndroid) {
		this.implementAndroidWorkaround = true;
		return;
	}
	const { key, code } = e;
	const mappedKey = this.mapKey(key);
	const isCommandKey = key !== mappedKey;
	if (!this.recentKeys[code]) this.recentKeys[code] = {};
	this.recentKeys[code].keydown = new Date().getTime();
	if (isCommandKey) {
		this.commandKeys[code] = { command: mappedKey, pressed: true };
	}
	// Prevent default tab key behavior
	if (key == "Tab") e.preventDefault();
	this.key = key;
	if (isCommandKey) {
		this[mappedKey] = true;
	} else if (key === "CapsLock") {
		this.capsLock = !this.capsLock;
	} else if (this.keysToRepeat.includes(key)) {
		// If you hold a key down, then keydown will repeat. These are the keys
		// that we want to capture repeat action.
		this.key = null;
		this.cb({ key, e, keystroke: this });
	}
};
/**
 * Identifies a keypress event.
 * @param {KeyboardEvent} e
 * @memberof CIQ.UI.Keystroke
 */
CIQ.UI.Keystroke.prototype.keypress = function (e) {
	if (this.noKeyCapture) return;
	var keyCode = e.which;
	if (keyCode < 32 || keyCode > 222) return; // handled by keydown
	this.key = e.key;
};
/**
 * Initializes member functions.
 * @memberof CIQ.UI.Keystroke
 * @private
 */
CIQ.UI.Keystroke.prototype.initialize = function () {
	var self = this;
	["keyup", "keydown", "keypress"].forEach(function (ev) {
		document.addEventListener(ev, function (e) {
			if (ev === "keydown") self.downValue = e.target.value;
			self[ev](e);
		});
	});
	window.addEventListener("blur", function (e) {
		// otherwise ctrl-t to switch tabs causes ctrl to get stuck
		self.ctrl = false;
		self.cb({ key: "Control", e: e, keystroke: self });
	});
};
/**
 * UI Helper for capturing and handling keystrokes.
 *
 * A helper or ContextTag can "claim" keystrokes and intercept them, otherwise the keystrokes will be handled by keyup and keydown.
 *
 * @param {HTMLElement} [node] The node or selector to which to attach. Defaults to `document` which means that hot keys will act globally.
 * If set to any other element (selector) then hot keys will only function when the mouse is hovering over that element.
 * @param {CIQ.UI.Context} context The context for the chart
 * @param {Object} [params] Parameters to drive the helper
 * @param {Function} [params.cb] Callback to handle hot keys.
 * @name CIQ.UI.KeystrokeHub
 * @since 5.1.0 Setting `node` to anything other than `document` allows keystrokes to be restricted by hover focus.
 * @constructor
 */
CIQ.UI.KeystrokeHub = function (node, context, params) {
	node = CIQ.UI.$(node || "document")[0];
	this.infocus = false;
	var self = this;
	if (node === document || node === document.body || node === window) {
		this.infocus = true;
	} else {
		node.addEventListener("mouseout", function () {
			self.infocus = false;
		});
		node.addEventListener("mouseover", function () {
			self.infocus = true;
		});
	}
	this.context = context;
	this.params = params ? params : {};
	({ hotkeyConfig: this.hotkeyConfig } = context.config || {});
	this.uiManager = CIQ.UI.getUIManager();
	this.uiManager.keystrokeHub = this; // Register the keystroke hub so that it can be found
	function handler() {
		return function () {
			self.handler.apply(self, arguments);
		};
	}
	this.keystroke = new CIQ.UI.Keystroke(handler(), {
		keysToRepeat: this.hotkeyConfig.keysToRepeat
	});
	// Array of element references for keyboard navigation. No element placed at index 0. This
	// allows tabIndex to represent either a positive (selected) and negative (deselected) value
	// for the selected element.
	this.tabOrder = [null];
	// Index of selected element for keyboard navigation.
	this.tabIndex = 0;
	// Get the value of 5% of the total context element height. Used to normalize y coordinates when sorting elements by position
	this.yNormalizationThreshold =
		this.context.topNode.getBoundingClientRect().height / 25;
	// Queryselectors for elements that will be added to the tabOrder array
	this.tabElementSelectors = [
		"cq-lookup",
		"cq-comparison[cq-marker]",
		"cq-study-legend[cq-panel-only]",
		"cq-menu.ciq-menu",
		".ciq-toggles cq-toggle",
		"cq-chartcontrol-group cq-toggle",
		".chartControls .chartSize span",
		"cq-show-range div",
		"[keyboard-navigation='true']"
	];
	// The element that the highlight will position over, as well as its position. An object of the following type is expected:
	// {element: HTMLElement, {x: number, y: number, width: number, height: number}}
	// This can be set by keyboard navigable components so the element isn't necessarily in the tabOrder array.
	this.tabActiveElement = null;
	// A reference to a component that has been handed control for internal navigation by setting its keyboardNavigation
	// property equal to a reference to this object.
	this.keyControlElement = null;
	// A reference to the highlight rectangle element
	this.highlightElement = null;
	// Halt keyboard navigation if the mouse button is used anywhere else.
	this.context.topNode.addEventListener("pointerdown", () =>
		this.tabOrderDeselect()
	);
	// Reenable the mouse pointer when the mouse is moved
	this.context.topNode.addEventListener("pointermove", () =>
		this.context.topNode.classList.remove("disable-mouse-pointer")
	);
	// Update the highlight position on resize
	this.context.stx.append("resizeChart", () => {
		this.highlightAlign();
	});
	// Subscribe to the keyboardNavigation channel and listen for calls to register elements
	const { channelSubscribe } = CIQ.UI.BaseComponent.prototype;
	const channel =
		(this.context.config.channels || {}).keyboardNavigation ||
		"channel.keyboardNavigation";
	channelSubscribe(
		channel,
		(value) => {
			if (value && value.action === "registerElements") {
				this.setTabOrderElements();
			}
		},
		this.context.stx
	);
};
CIQ.inheritsFrom(CIQ.UI.KeystrokeHub, CIQ.UI.Helper);
/**
 * Global default hotkey method. Pass this or your own method in to {@link CIQ.UI.KeystrokeHub}
 * @memberof CIQ.UI.KeystrokeHub
 * @param  {number} key The pressed key
 * @param  {CIQ.UI.KeystrokeHub} hub The hub that processed the key
 * @param  {Object} hub.hotkeyConfig Hotkey settings options
 * @param  {Object} hub.hotkeys Specifies the default hotkeys
 * @param  {KeyboardEvent} e The KeyboardEvent that triggered the function call
 * @return {boolean}     Return true if you captured the key
 */
CIQ.UI.KeystrokeHub.defaultHotKeys = function (key, hub, e = {}) {
	const { hotkeyConfig = {}, keystroke, context } = hub;
	const { hotkeys = [] } = hotkeyConfig;
	const { stx } = context;
	const { code, keyCode } = e || {};
	const numpadCode = code && code.includes("Numpad");
	if (key === "Unidentified") key = String.fromCharCode(keyCode); // legacy edge support
	return hotkeys
		.slice()
		.reverse() // process in reverse order to allow dev/user to override existing functionality
		.reduce(function flattenCommands(acc, { action, commands, options }) {
			return acc.concat(
				commands.map((command) => ({ action, command, options }))
			);
		}, [])
		.map(function parseCommands({ action, command, options }) {
			if (command === "+") command = ["+"];
			else if (command.slice(-2) === "++") {
				command = command.slice(0, -2).split("+").concat("+");
			} else command = command.split("+");
			return {
				action,
				options,
				modifiers: command.slice(0, -1),
				commandKey: command.slice(-1)[0],
				specificity: command.length
			};
		})
		.filter(function filterCommands({ modifiers, commandKey }) {
			// numpad keys have to match code, other keys can match either code or key
			let commandKeyMatches = (numpadCode ? [code] : [code, key]).includes(
				commandKey
			);
			let modifiersMatch =
				!modifiers.length ||
				modifiers.every((modifier) => keystroke[keystroke.mapKey(modifier)]);
			return commandKeyMatches && modifiersMatch;
		})
		.sort(function sortHigherSpecificityCommandsToFront(a, b) {
			return b.specificity - a.specificity;
		})
		.some(function executeCommands({ action, options }) {
			// some returns true as soon as soon any of its callbacks return true
			if (typeof action === "string") {
				return CIQ.UI.KeystrokeHub.executeHotkeyCommand({
					stx,
					action,
					options
				});
			}
			if (typeof action === "function") {
				// if user wants to chain commands that must be specified by returning false
				return action({ stx, options }) !== false;
			}
		});
};
/**
 * Global method to add a hot key handler. Hot keys are defined in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
 * @memberof CIQ.UI.KeystrokeHub
 * @param  {string} identifier Name identifying the keystroke handler
 * @param  {function} handler Function to call when the hot key combination is pressed.
 * @param {CIQ.ChartEngine} stx A reference to the chart engine.
 */
CIQ.UI.KeystrokeHub.addHotKeyHandler = function (identifier, handler, stx) {
	CIQ.UI.observeProperty("uiContext", stx, ({ value: uiContext }) => {
		if (!uiContext) return;
		setTimeout(() => {
			// Updated hotkey alias if available to action
			const configKeyEntry = CIQ.getFromNS(
				uiContext.config,
				"hotkeyConfig.hotkeys",
				[]
			).find(({ action }) => action === identifier);
			if (configKeyEntry) {
				configKeyEntry.action = handler;
			}
		});
	});
};
/**
 * Default hotkey execution. Called from {@link CIQ.UI.KeystrokeHub.defaultHotKeys}.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @param {object} params
 * @param {CIQ.ChartEngine} params.stx A reference to the chart engine.
 * @param {string} params.action The action to execute
 * @param {object} [params.options] Any options specified in the config
 * @return {boolean} Return true if command was executed, false if invalid command
 */
CIQ.UI.KeystrokeHub.executeHotkeyCommand = function ({
	stx,
	action,
	options = {}
}) {
	const { crosshair, candleWidth } = stx.layout;
	const { left, right, panel } = stx.chart;
	const height = stx.height - stx.xaxisHeight;
	const { percent = 0, bars = 0 } = options;
	const keystrokeHub = document.body.keystrokeHub;
	const { topNode } = stx.uiContext;
	const positionCrosshairs = ({ axis, direction = 1 } = {}) => {
		const { cx, cy } = stx;
		let change = 0; // default case: initial positioning, no adjustment
		if (axis === "x") change = candleWidth * bars;
		if (axis === "y") change = height * percent;
		if (!(cx || cx === 0)) stx.cx = Math.round(stx.width / 2);
		if (!(cy || cy === 0)) stx.cy = Math.round(height / 2);
		if (change) {
			let newValue = stx["c" + axis] + change * direction;
			newValue = Math.max(newValue, axis === "x" ? left + 1 : 0);
			newValue = Math.min(newValue, axis === "x" ? right - 1 : height);
			stx["c" + axis] = Math.round(newValue);
		}
		stx.mousemoveinner(stx.resolveX(stx.cx), stx.resolveY(stx.cy));
		stx.draw();
	};
	const scrollChart = ({ direction = 1, page } = {}) => {
		const { dataSet, scroll, maxTicks } = stx.chart;
		let change = page ? maxTicks : bars;
		change *= direction; // will flip negative if direction is -1
		if (scroll + change >= dataSet.length) {
			stx.chart.scroll = dataSet.length;
		} else {
			stx.chart.scroll += change;
		}
		stx.draw();
		stx.headsUpHR();
	};
	const scrollYAxis = (direction = 1) => {
		let change = height * percent * direction;
		stx.chart.yAxis.scroll += change;
		stx.draw();
	};
	const zoomYAxis = (direction = 1) => {
		const allAxes = [...panel.yaxisLHS, ...panel.yaxisRHS];
		allAxes.forEach((axis) => {
			let newZoom = axis.zoom + 25 * direction;
			// Prevent zooming past the "flip" boundary
			if (newZoom < axis.height) axis.zoom = newZoom;
		});
		stx.draw();
	};
	switch (action) {
		case "up":
			if (crosshair) positionCrosshairs({ axis: "y", direction: -1 });
			else scrollYAxis();
			break;
		case "down":
			if (crosshair) positionCrosshairs({ axis: "y" });
			else scrollYAxis(-1);
			break;
		case "right":
			if (crosshair) positionCrosshairs({ axis: "x" });
			else scrollChart({ direction: -1 });
			break;
		case "left":
			if (crosshair) positionCrosshairs({ axis: "x", direction: -1 });
			else scrollChart();
			break;
		case "pageRight":
			scrollChart({ direction: -1, page: true });
			break;
		case "pageLeft":
			scrollChart({ page: true });
			break;
		case "zoomInXAxis":
			if (stx.allowZoom) stx.zoomIn();
			break;
		case "zoomOutXAxis":
			if (stx.allowZoom) stx.zoomOut();
			break;
		case "zoomInYAxis":
			zoomYAxis(-1);
			break;
		case "zoomOutYAxis":
			zoomYAxis();
			break;
		case "toggleCrosshairs":
			const toggle = topNode.querySelector('cq-toggle[cq-member="crosshair"]');
			if (toggle) toggle.dispatchEvent(new Event("stxtap"));
			else stx.layout.crosshair = !stx.layout.crosshair;
			positionCrosshairs();
			break;
		case "toggleContinuousZoom":
			if (stx.continuousZoom) stx.continuousZoom.smartZoomToggle();
			break;
		case "symbolLookup":
			let lookupNode = topNode.querySelector(
				".ciq-search cq-lookup cq-lookup-input input"
			);
			if (lookupNode) lookupNode.focus();
			break;
		case "home":
			stx.home();
			stx.headsUpHR();
			break;
		case "end":
			stx.chart.scroll = stx.chart.dataSet.length;
			stx.draw();
			stx.headsUpHR();
			break;
		case "delete":
			if (CIQ.ChartEngine.drawingLine) {
				stx.undo();
			} else if (stx.anyHighlighted) {
				stx.deleteHighlighted();
			} else {
				return false;
			}
			break;
		case "escape":
			// Uncomment the following line if you wish to use the escape key to exit keyboard navigation.
			// Do not use this if you enable the full screen feature as the escape key is reserved by the browser for exiting full screen mode.
			// Check for modal state first because we don't want to deselect when escaping out of a menu
			// if (!stx.uiContext.isModal()) keystrokeHub.tabOrderDeselect();
			if (CIQ.ChartEngine.drawingLine) {
				stx.undo();
			} else {
				const uiManager = CIQ.UI.getUIManager();
				if (uiManager) uiManager.closeMenu();
			}
			break;
		case "keyboardNavigateDeselect":
			keystrokeHub.tabOrderDeselect();
			break;
		case "keyboardNavigateNext":
			keystrokeHub.tabIndexNext();
			break;
		case "keyboardNavigatePrevious":
			keystrokeHub.tabIndexNext(true);
			break;
		case "keyboardNavigateClick":
			keystrokeHub.tabOrderClickSelected();
			break;
		default:
			return false; // not captured
	}
	return true;
};
/**
 * Queries elements assigned for keyboard navigation and adds references to an internal tab order
 * array.
 *
 * This function is called automatically when `{ action: "registerElements" }` is written to the
 * `keyboardNavigation` UI channel, which is done both when the component UI loads and the chart
 * HTML UI loads.
 *
 * Elements can be added manually to the tab order by assigning the attribute
 * `keyboard-navigation="true"`.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.setTabOrderElements = function () {
	// Check for an existing selected element
	let selectedElement = null;
	if (this.tabIndex !== 0) {
		// An item is selected. Hold on to it in case its position in the array changes.
		selectedElement = this.tabOrder[Math.abs(this.tabIndex)].element;
	}
	// No element placed at index 0. This allows tabIndex to represent either a positive (selected)
	// and negative (deselected) value for the selected element.
	this.tabOrder = [null];
	for (let idx = 0; idx < this.tabElementSelectors.length; idx++) {
		const elements = this.context.topNode.querySelectorAll(
			this.tabElementSelectors[idx]
		);
		for (let idx = 0; idx < elements.length; idx++) {
			const element = elements[idx];
			if (element.getAttribute("keyboard-navigation") === "false") continue;
			// Add a stxtap listener to the element to move the index to this element if click/tapped
			element.addEventListener(
				"stxtap",
				function (element) {
					// Find the tabOrder index of the element
					let targetIndex = this.tabOrder.findIndex(
						(item) => item && item.element === element
					);
					if (targetIndex != this.tabIndex) {
						// Something else received an interaction, likely with the mouse. Shift keyboard focus to this element.
						this.tabOrderDeselect();
						this.tabIndex = -targetIndex;
					}
					return true;
				}.bind(this, element)
			);
			this.tabOrder.push({
				element: element
			});
		}
	}
	this.sortTabOrderElements(selectedElement);
};
/**
 * Sorts elements in the tabOrder array based on their screen position; first from left to right,
 * then from top to bottom.
 *
 * If `elementToSelect` is not provided, and the local tabIndex property points to an element,
 * tabIndex is updated to point to the same element at its new position in the array.
 *
 * @param {HTMLElement} [elementToSelect] The element to reference by tabIndex after the array has
 * 		been sorted.
 *
 * @memberof CIQ.UI.KeystrokeHub#
 * @alias sortTabOrderElements
 * @private
 * @since 8.3.0
 */
CIQ.UI.KeystrokeHub.prototype.sortTabOrderElements = function (
	elementToSelect
) {
	const isNeg = this.tabIndex < 0;
	// If elementToSelect is not set, check for an existing selected element
	if (!elementToSelect && this.tabIndex !== 0) {
		// An item is selected. Hold on to it in case its position in the array changes.
		if (this.tabOrder[Math.abs(this.tabIndex)])
			elementToSelect = this.tabOrder[Math.abs(this.tabIndex)].element;
	}
	// Update each element position
	this.tabOrder.forEach((tabItem) => {
		if (!tabItem) return;
		const { x, y, width, height } = tabItem.element.getBoundingClientRect();
		tabItem.position = { x, y, width, height };
	});
	// Sort elements based on their position
	this.tabOrder.sort((a, b) => {
		if (a === null || b === null) return;
		return (
			Math.floor(a.position.y / this.yNormalizationThreshold) -
				Math.floor(b.position.y / this.yNormalizationThreshold) ||
			a.position.x - b.position.x
		);
	});
	// Update the tabIndex to match the previously selected element
	if (elementToSelect)
		this.tabOrder.forEach((tabItem, idx) => {
			if (!tabItem) return;
			if (tabItem.element == elementToSelect) {
				this.tabIndex = isNeg ? -idx : idx;
			}
		});
};
/**
 * Sets an element as the active keyboard control element.
 *
 * Disables internal keyboard navigation in the element that currently has control.
 *
 * Gives `element` control by assigning the keystroke hub object to the element's
 * `keyboardNavigation` property. The element's `onKeyboardSelection` method, if available, is
 * then called.
 *
 * @param {HTMLElement} [element] Element to give access to the keystroke hub for internal
 * 		navigation. If this parameter is not provided, the function still disables keyboard
 * 		navigation in the element that currently has control.
 * @param {boolean} [skipDeselectionCallback] If true, prevents the `onKeyboardDeselection`
 * 		callback function of the element that currently has control from being called when that
 * 		element is disabled.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.setKeyControlElement = function (
	element,
	skipDeselectionCallback
) {
	// If there's no current element to disable and no new element to enable, give up.
	if (!this.keyControlElement && !element) return;
	// Disable the element that has keyboard control
	this.disableKeyControlElement(
		this.keyControlElement,
		skipDeselectionCallback
	);
	if (element) {
		// If provided, hand keyboard control to the new element
		this.keyControlElement = element;
		// Pass a reference to the keystroke hub to the active element
		this.keyControlElement.keyboardNavigation = this;
		// Call onKeyBoardNavigation in the element if available. This is used to
		// signal the component to take over with its internal keyboard navigation.
		if (typeof this.keyControlElement.onKeyboardSelection === "function")
			this.keyControlElement.onKeyboardSelection();
	}
};
/**
 * Disables internal keyboard navigation in `element` by setting its internal `keyboardNavigation`
 * property to null. Calls the element's `onKeyboardDeselection` method if available.
 *
 * @param {HTMLElement} element Element for which keyboard navigation is disabled.
 * @param {boolean} [skipDeselectionCallback] If true, prevents the `onKeyboardDeselection`
 * 		callback function of the disabled element from being called.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.disableKeyControlElement = function (
	element,
	skipDeselectionCallback
) {
	if (!element) return;
	// Remove keyboard navigation from the current element
	if (
		!skipDeselectionCallback &&
		typeof element.onKeyboardDeselection === "function"
	)
		element.onKeyboardDeselection();
	// Remove the component reference to the keystroke hub
	element.keyboardNavigation = null;
};
/**
 * Sets the currently selected element in the tab order to a deselected state and, if `eventsOnly`
 * is false, removes the selected element highlighting.
 *
 * Before deselecting the element, calls the element's `onKeyboardDeselection` callback function
 * if that function is available.
 *
 * @param {boolean} [eventsOnly] If true, sets the element's internal deselected state without
 * 		changing the keystroke hub's tab index or the element's highlighting.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.tabOrderDeselect = function (eventsOnly) {
	const { tabOrder, tabIndex } = this;
	if (tabIndex <= 0) return;
	if (tabOrder[tabIndex])
		this.disableKeyControlElement(tabOrder[tabIndex].element);
	if (!eventsOnly) {
		this.tabActiveElement = null;
		this.tabIndex = -this.tabIndex;
		this.highlightHide();
		// Restore the mouse pointer
		this.context.topNode.classList.remove("disable-mouse-pointer");
	}
};
/**
 * Highlights the selected element in the tab order.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.tabOrderSelect = function () {
	const { tabOrder, tabIndex } = this;
	if (tabIndex <= 0) return;
	this.highlightPosition(tabOrder[tabIndex]);
};
/**
 * Simulates a mouse click on the selected element in the tab order.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.tabOrderClickSelected = function () {
	const { tabOrder, tabIndex } = this;
	if (tabOrder.length <= 1) return;
	if (tabIndex <= 0) return;
	// Give key control to the selected element
	this.setKeyControlElement(tabOrder[tabIndex].element);
	// Simulate a click
	tabOrder[tabIndex].element.dispatchEvent(new Event("pointerdown"));
	tabOrder[tabIndex].element.dispatchEvent(new Event("pointerup"));
};
/**
 * Sets the keystroke hub tab index to the next available element. Elements that are not visible
 * are skipped. If the last element in the tab order is bypassed, indexing loops back to the
 * beginning of the tab order. If tabbing in reverse and the first element of the tab order is
 * bypassed, indexing loops around to the end of the tabbing order.
 *
 * @param {boolean} reverse Set to `true` to set the index to the previous element, rather than
 * 		the next.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.tabIndexNext = function (reverse) {
	if (this.tabOrder.length <= 1) return;
	let setNextElement = function (self, reverse) {
		// Change the tabIndex
		if (reverse === true) {
			self.tabIndex--;
		} else {
			self.tabIndex++;
		}
		// Loop back when out of the array bounds
		if (self.tabIndex >= self.tabOrder.length) self.tabIndex = 1;
		if (self.tabIndex < 1) self.tabIndex = self.tabOrder.length - 1;
	};
	// Sort the elements based on screen position.
	this.sortTabOrderElements();
	// A negative index represents a deselected state of that index
	// invert it to select the current index rather than change it
	// This allows the user to re-select a previously deselected item
	if (this.tabIndex < 0) {
		this.tabIndex = Math.abs(this.tabIndex);
	} else {
		// If the tabIndex is already positive, deselect the current element but keep the index unchanged.
		this.tabOrderDeselect(true);
		setNextElement(this, reverse);
	}
	// If the current selected element isn't visible, find the next in line that is
	while (!CIQ.trulyVisible(this.tabOrder[this.tabIndex].element)) {
		setNextElement(this, reverse);
	}
	this.tabOrderSelect();
};
/**
 * Sets the size and position of the highlight DOM element to match the bounding box of the
 * active keyboard navigation element specified by `targetInfo.element`. If a highlight DOM
 * element does not exist, one is created.
 *
 * If `targetInfo` is not provided, the active keyboard navigation element is set to the last
 * element selected by the tabIndexNext function.
 *
 * @param {object} [targetInfo] Contains data that identifies and describes the active keyboard
 * 		navigation element.
 * @param {HTMLElement} targetInfo.element The active keyboard navigation element, which the
 * 		highlight DOM element is positioned over.
 * @param {object} targetInfo.position The screen coordinates and dimensions of the active
 * 		keyboard navigation element. Usually retrieved from Element.getBoundingClientRect().
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.highlightPosition = function (targetInfo) {
	if (!targetInfo || !targetInfo.element || !targetInfo.position) {
		const { tabOrder, tabIndex } = this;
		// Give up if nothing was passed and tabIndex is pointing to nothing
		if (tabIndex <= 0) return;
		targetInfo = tabOrder[tabIndex];
	}
	this.tabActiveElement = targetInfo;
	this.highlightAlign();
};
/**
 * Positions the highlight DOM element using the coordinates and dimensions of the bounding
 * rectangle of the active keyboard navigation element.
 *
 * Use the highlightPosition function to set the active keyboard navigaton element before calling
 * this function.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.highlightAlign = function () {
	if (this.tabActiveElement) {
		// The element position can change over time, during a window resize for example. getBoundingClientRect
		// is called every time to ensire the highlight is aligned with the current position of the element.
		const selectedElementRect = this.tabActiveElement.element.getBoundingClientRect();
		// Remove the highlight if the element has no dimension
		if (selectedElementRect.width <= 0 || selectedElementRect.height <= 0) {
			this.highlightHide();
			return;
		}
		this.highlightCreate();
		Object.assign(this.highlightElement.style, {
			top: selectedElementRect.top + "px",
			left: selectedElementRect.left + "px",
			width: selectedElementRect.width + "px",
			height: selectedElementRect.height + "px"
		});
	}
};
/**
 * Creates a `cq-keyboard-selected-highlight` element if one does not already exist, and attaches
 * it to the top node of the chart UI context. If a `cq-keyboard-selected-highlight` element
 * already exists, returns the element.
 *
 * @return {HTMLElement} The `cq-keyboard-selected-highlight` element.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.highlightCreate = function () {
	if (!this.highlightElement) {
		this.highlightElement = document.createElement(
			"cq-keyboard-selected-highlight"
		);
		this.context.topNode.appendChild(this.highlightElement);
	} else {
		this.highlightElement.classList.remove("disabled");
	}
	// Hide the mouse pointer
	this.context.topNode.classList.add("disable-mouse-pointer");
	return this.highlightElement;
};
/**
 * Removes the `cq-keyboard-selected-highlight` element from the display.
 *
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 * @since 8.2.0
 */
CIQ.UI.KeystrokeHub.prototype.highlightHide = function () {
	if (this.highlightElement) this.highlightElement.classList.add("disabled");
};
/**
 * Change the active context for the hub, for instance when dealing with multiple charts.
 *
 * @param {CIQ.UI.Context} context The context
 * @memberof CIQ.UI.KeystrokeHub
 */
CIQ.UI.KeystrokeHub.prototype.setActiveContext = function (context) {
	this.context = context;
};
/**
 * @param hub
 * @param key
 * @param e Event
 * @param keystroke
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 */
CIQ.UI.KeystrokeHub.prototype.processKeyStrokeClaims = function (
	hub,
	key,
	e,
	keystroke
) {
	for (var i = claims.length - 1; i > -1; i--) {
		var helper = claims[i].helper;
		var response = helper.keyStroke(hub, key, e, keystroke);
		if (response) {
			if (!response.allowDefault) e.preventDefault();
			return true;
		}
	}
	return false;
};
/**
 * Handles keystrokes
 * @param  {Object} obj Event object
 * @memberof CIQ.UI.KeystrokeHub
 * @private
 */
CIQ.UI.KeystrokeHub.prototype.handler = function (obj) {
	var stx = this.context.stx;
	if (stx.editingAnnotation) return;
	// If the keystrokehub is associated with a specific element, then it will only
	// process key events when that element is in focus
	if (!this.infocus) return;
	var e = obj.e,
		key = obj.key,
		keystroke = obj.keystroke,
		targetTagName = obj.e.target.tagName;
	switch (key) {
		case "Shift":
			stx.shift = keystroke.shift;
			break;
		case "Control":
		case "Alt":
			stx.ctrl = keystroke.ctrl;
			break;
		case "Meta":
		case "Win":
			stx.cmd = keystroke.cmd;
			break;
		case "CapsLock":
			this.capsLock = !this.capsLock;
			break;
		default:
			break;
	}
	let escTabPress = e.key === "Escape" || e.key === "Esc" || e.key === "Tab";
	// process default claims before added claims
	if (
		this.params.cb &&
		// Allow an escape or tab press on an input field.
		((targetTagName === "INPUT" && escTabPress) || targetTagName !== "INPUT") &&
		targetTagName !== "TEXTAREA" &&
		!this.context.isLegendKeyboardActive() &&
		!(this.context.isModal() && !escTabPress)
	) {
		if (this.params.cb(key, this, e)) return e.preventDefault();
	}
	if (!CIQ.ChartEngine.drawingLine) {
		if (this.processKeyStrokeClaims(this, key, e, keystroke)) return;
	}
};
/**
 * Self-registering global web component that manages the overall UI on the attached `div` tag.
 *
 * Designed to be used as a helper method for the included {@link WebComponents}. A full tutorial
 * on how to work with and customize the web components can be found here:
 * {@tutorial Web Component Interface}.
 *
 * This component keeps track of open menus and dialogs and attaches click and tap (onclick or
 * ontouch) events to close them.
 *
 * By default, this web component is attached to the `body` element, but it can be attached to a
 * `div` tag if this behavior is too broad for your particular implementation.
 *
 * @namespace WebComponents.cq-ui-manager
 * @see CIQ.UI.UIManager
 */
class UIManager extends HTMLElement {
	/**
	 * Handles tap events and callbacks and prevents underlay clicks.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the web components can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * Creates an array of the active menus (the active menu stack) to keep track of which menu
	 * component is currently active.
	 *
	 * @name CIQ.UI.UIManager
	 * @constructor
	 */
	constructor() {
		super();
		this.activeMenuStack = [];
		this.registeredForResize = [];
		this.keystrokehub = null;
		CIQ.installTapEvent(document.body, { preventUnderlayClick: false });
		var self = this;
		function handleTap() {
			self.closeTopMenu();
		}
		document.body.addEventListener("stxtap", handleTap);
	}
	/**
	 * Attaches a "resize" event listener to an individual component as part of the context.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the web components can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias attachedCallback
	 */
	connectedCallback() {
		var self = this;
		this.resize = function () {
			var rr = self.registeredForResize;
			for (var i = 0; i < rr.length; i++) {
				if (typeof rr[i].resize == "function") rr[i].resize();
			}
		};
		window.addEventListener("resize", this.resize);
		if (document.body.contains(this)) {
			// cq-ui-manager tag exists, must want old way of loading components
			CIQ.UI.registerComponentsImmediately = true;
			CIQ.UI.ensureComponentsRegistered();
		}
	}
	/**
	 * Removes a "resize" event listener from a component.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the WebComponents can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @alias detachedCallback
	 * @memberof CIQ.UI.UIManager
	 */
	disconnectedCallback() {
		window.removeEventListener("resize", this.resize);
	}
	/**
	 * Closes the current active menu and resets the active menu stack.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the web components can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @param {HTMLElement} [menu] The menu to be closed. If a menu is not specified, all active
	 * 		menus are closed.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias closeMenu
	 */
	closeMenu(menu) {
		var activeMenuStack = this.activeMenuStack;
		var closeThese = [];
		if (menu) {
			// if menu is specified then close it
			closeThese.push(menu);
			// along with any active parent menus
			menu = menu.parentElement;
			while (menu) {
				if (menu.matches("cq-menu") && menu.active) closeThese.push(menu);
				menu = menu.parentElement;
			}
		} else {
			// close them all if no menu is specified
			closeThese = activeMenuStack;
		}
		// hide all the items we've decided to close
		for (var j = 0; j < closeThese.length; j++) {
			closeThese[j].hide();
		}
		// filter out the ones that are inactive
		this.activeMenuStack = activeMenuStack.filter(function (item) {
			return item.active;
		});
		this.ifAllClosed();
	}
	/**
	 * Closes the menu that is at the top of the active menu stack.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias closeTopMenu
	 * @since 6.2.0 Added `cq-close-top` menu attribute to optionally close parent menus.
	 *
	 * @example
	 * <cq-dialog>
	 *     <cq-drawing-context>
	 *         <cq-menu cq-close-top="cq-dialog[cq-drawing-context]">
	 *             <div>This is a sub-menu</div>
	 *             <cq-menu-dropdown>
	 *                 <cq-item>A stxtap event that bubbles to body will call UIManager#closeTopMenu</cq-item>
	 *                 <cq-item>With the cq-close-top attribute above, the dialog will be closed as well</cq-item>
	 *             </cq-menu-dropdown>
	 *         </cq-menu>
	 *     </cq-drawing-context>
	 * </cq-dialog>
	 */
	closeTopMenu() {
		var activeMenuStack = this.activeMenuStack;
		if (!activeMenuStack.length) return;
		var menu = activeMenuStack[activeMenuStack.length - 1];
		// If the top menu is a dialog, and isn't active yet then it has just been added, don't remove it
		var self = this;
		if (!menu.isDialog || menu.active) {
			activeMenuStack.pop();
			menu.hide();
			if (menu.onClose) menu.onClose();
			setTimeout(function () {
				self.ifAllClosed(); // Put this in a timeout so that a click on the body doesn't start a drawing
			}, 0);
		}
		var close = menu.getAttribute("cq-close-top");
		if (close) {
			CIQ.climbUpDomTree(menu.parentElement, close).forEach(function (m) {
				self.closeMenu(m);
			});
		}
	}
	/**
	 * Finds all `cq-lift` elements for the specified menu, but not lifts that are within nested
	 * menus.
	 *
	 * @param {HTMLElement} menu The menu to search for `cq-lift` elements.
	 * @return {object} Any found lifts as a jQuery object, if available, or an {@link Faquery}
	 * 		object.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias findLifts
	 * @since 8.1.0
	 */
	findLifts(menu) {
		return CIQ.UI.$(
			Array.from(menu.querySelectorAll("*[cq-lift]")).filter(function (lift) {
				// only valid if the closest cq-menu or cq-dialog parent is the menu itself
				// otherwise the lift is in a nested menu
				return lift.closest("cq-menu,cq-dialog") == menu;
			})
		);
	}
	/**
	 * Ends modal mode if there are no active menus. See also {@link CIQ.ChartEngine#modalEnd}.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias ifAllClosed
	 */
	ifAllClosed() {
		if (!this.activeMenuStack.length) {
			Array.from(document.querySelectorAll("cq-context,*[cq-context]")).forEach(
				function (context) {
					if (
						context.CIQ &&
						context.CIQ.UI &&
						context.CIQ.UI.context &&
						context.CIQ.UI.context.stx
					)
						context.CIQ.UI.context.stx.modalEnd();
				}
			);
		}
	}
	/**
	 * Lifts a menu to an absolute position on the `body` element, so that it can rise above any
	 * `hidden` or `scroll` overflow situations.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the web components can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * Use the `cq-lift` attribute to indicate that the menu should be lifted when opened.
	 *
	 * @param {HTMLElement} element DOM node to be lifted.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias lift
	 */
	lift(element) {
		var n = element;
		if (!n) return;
		n.remember = {
			parentNode: n.parentNode,
			css: {
				position: n.style.position,
				display: n.style.display,
				left: n.style.left,
				top: n.style.top,
				height: n.style.height,
				width: n.style.width,
				opacity: n.style.opacity
			}
		};
		var offset = n.getBoundingClientRect();
		var height = n.scrollHeight;
		n.remove();
		n.reduceMenuHeight = 5;
		Object.assign(n.style, {
			position: "absolute",
			display: "block",
			left: offset.left + "px",
			top: offset.top + "px",
			height: height + "px",
			opacity: 1
		});
		document.body.appendChild(n);
		if (typeof n.resize != "undefined") n.resize();
		Array.from(n.querySelectorAll("cq-scroll")).forEach(function (scroll) {
			scroll.resize();
		});
	}
	/**
	 * Opens a menu item within the chart {@link CIQ.UI.Context}.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the web components can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @param {HTMLElement} menu The menu to be opened.
	 * @param {object} params Configuration parameters for the opened menu.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias openMenu
	 */
	openMenu(menu, params) {
		// Find the first input box, if any, and give focus
		setTimeout(function () {
			var input = menu.querySelector("input[cq-focus]:first-child");
			if (input) input.focus();
		}, 0);
		this.activeMenuStack.push(menu);
		menu.show(params);
		Array.from(document.querySelectorAll("cq-context,*[cq-context]")).forEach(
			function (context) {
				if (
					context.CIQ &&
					context.CIQ.UI &&
					context.CIQ.UI.context &&
					context.CIQ.UI.context.stx
				)
					context.CIQ.UI.context.stx.modalBegin();
			}
		);
	}
	/**
	 * Registers a resize event listener for `element`.
	 *
	 * @param {HTMLElement} element The element for which the resize event listener is registered.
	 * 		The element must define a function with the signature `resize()`. The function is
	 * 		called in response to a resize event.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias registerForResize
	 * @private
	 */
	registerForResize(element) {
		this.registeredForResize.push(element);
	}
	/**
	 * Restores `element` to its position in the DOM tree before the element was lifted. Also
	 * restores the element's CSS settings to the settings that existed before the element was
	 * lifted.
	 *
	 * @param {HTMLElement} element The DOM node to be restored.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias restoreLift
	 */
	restoreLift(element) {
		if (!element) return;
		var remember = element.remember;
		element.remove();
		Object.assign(element.style, remember.css);
		remember.parentNode.appendChild(element);
	}
	/**
	 * Gets the topmost menu in the active menu stack.
	 *
	 * Designed to be used as a helper method for the included {@link WebComponents}. A full
	 * tutorial on how to work with and customize the web components can be found here:
	 * {@tutorial Web Component Interface}.
	 *
	 * @return {HTMLElement} The topmost active menu.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias topMenu
	 */
	topMenu() {
		var activeMenuStack = this.activeMenuStack;
		if (!activeMenuStack.length) return null;
		return activeMenuStack[activeMenuStack.length - 1];
	}
	/**
	 * Unregisters the resize event listener for `element`.
	 *
	 * @param {HTMLElement} element The element for which the resize event listener is removed.
	 *
	 * @memberof CIQ.UI.UIManager
	 * @alias unregisterForResize
	 * @private
	 */
	unregisterForResize(element) {
		var rr = this.registeredForResize;
		for (var i = 0; i < rr.length; i++) {
			if (rr[i] === element) {
				rr.splice(i, 1);
				return;
			}
		}
	}
}
CIQ.UI.UIManager = UIManager;
/**
 * Obtains a reference to the document's [cq-ui-manager]{@link WebComponents.cq-ui-manager}
 * instance or, if one does not exist, creates an instance.
 *
 * Avoids the need for a `cq-ui-manager` singleton when multiple charts are present in one
 * document.
 *
 * @returns {CIQ.UI.UIManager} A reference to the document's UI manager.
 *
 * @memberof CIQ.UI
 * @since 7.5.0
 */
CIQ.UI.getUIManager = function () {
	if (CIQ.UI._uiManager) return CIQ.UI._uiManager;
	let uiManager = document.querySelector("cq-ui-manager");
	if (!uiManager) {
		// if node has not been attached create and initiate uiManager
		uiManager = new CIQ.UI.UIManager();
		uiManager.connectedCallback();
	}
	CIQ.UI._uiManager = uiManager;
	return uiManager;
};
customElements.define("cq-ui-manager", UIManager);
// extract methods to use as functions
const {
	qs,
	qsa,
	channelWrite,
	channelRead,
	channelSubscribe
} = CIQ.UI.BaseComponent.prototype;
/**
 * The Chart class contains a collection of methods used to instantiate and configure charts
 * and the chart user interface.
 *
 * The decisions on what to initiate and how it gets initiated are based on the provided
 * configuration object and the availabilty of resources loaded in the {@link CIQ} namespace.
 *
 * @name CIQ.UI.Chart
 * @class
 * @since 7.5.0
 */
class Chart {
	/**
	 * Creates the chart engine and user interface, including the UI context.
	 *
	 * @param {object} [params] Function parameters.
	 * @param {HTMLElement} [params.container] The HTML element that hosts the user interface
	 * 		elements of the chart. The element is a `cq-context` element, or it contains a
	 * 		`cq-context` element or element with a `cq-context` attribute. The context element,
	 * 		in turn, contains a chart container element; that is, an element with class
	 * 		`chartContainer`.
	 * @param {object} [params.config] Configuration for the chart engine, UI elements, and
	 * 		plug-ins. See the {@tutorial Chart Configuration} tutorial for more information.
	 * @return {CIQ.UI.Context} The chart UI context.
	 *
	 * @alias createChartAndUI
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	createChartAndUI({ container, config }) {
		if (!container) container = document.body;
		if (config && !config.chartId) config.chartId = container.id;
		const contextContainer = getContextContainer(container);
		const stx = CIQ.ChartEngine.create({
			container: qs(".chartContainer", contextContainer),
			config,
			deferLoad: true
		});
		CIQ.UI.scrollbarStyling = config.scrollbarStyling;
		CIQ.UI.ensureComponentsRegistered();
		const uiContext = new CIQ.UI.Context(stx, contextContainer);
		uiContext.config = config;
		container.context = uiContext; // make context available for grid
		// create UI helpers
		new CIQ.UI.Layout(uiContext);
		new CIQ.UI.StudyEdit(null, uiContext);
		this.initLookup(uiContext);
		this.initContainerListeners(uiContext);
		this.initEventMarkers(uiContext);
		this.initDrawingTools(uiContext);
		this.initDrawingEditListeners(uiContext);
		this.initDialogHandler(uiContext);
		this.initColorPicker();
		this.initExtensions({ stx, uiContext, config, type: "plugins" });
		this.loadChart(uiContext);
		if (config.language) CIQ.I18N.setLanguage(stx, config.language);
		CIQ.UI.BaseComponent.buildReverseBindings(contextContainer);
		contextContainer.bindingInitiated = true;
		CIQ.UI.begin(config.onWebComponentsReady); // initiates webcomponent taps and binding
		// Call to setTabOrderElements is moved to the event queue so the dom has a chance to render
		window.setTimeout(function () {
			// Update the keystrokeHub tabOrder array
			document.body.keystrokeHub.setTabOrderElements();
		}, 0);
		return uiContext;
		function getContextContainer(container) {
			if (
				container.nodeName.match(/cq-context/i) ||
				container.getAttribute("cq-container")
			) {
				return container;
			}
			return container.querySelector("cq-context, [cq-context]");
		}
	}
	/**
	 * Initializes the chart container size change listener, channel subscriptions, and the
	 * keystroke hub and its focus management (see {@link CIQ.UI.KeystrokeHub}).
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 *
	 * @alias initContainerListeners
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initContainerListeners(uiContext) {
		const {
			config: {
				channels: {
					breakpoint = "channel.breakpoint",
					sidenavSize = "channel.sidenavSize",
					sidepanelSize = "channel.sidepanelSize",
					drawingPalettes = "channel.drawingPalettes",
					pluginPanelHeight = "channel.pluginPanelHeight"
				} = {}
			} = {},
			stx,
			topNode: contextContainer
		} = uiContext;
		CIQ.UI.addResizeListener(contextContainer, () =>
			this.notifySizeChanges(uiContext)
		);
		this.notifySizeChanges(uiContext);
		channelSubscribe(breakpoint, this.breakpointSetter(uiContext), stx);
		channelSubscribe(sidenavSize, this.sidenavSizeSetter(uiContext), stx);
		channelSubscribe(sidepanelSize, this.sidepanelSizeSetter(uiContext), stx);
		channelSubscribe(drawingPalettes, this.chartPositionSetter(uiContext), stx);
		channelSubscribe(
			pluginPanelHeight,
			this.chartAreaTopSetter(uiContext),
			stx
		);
		const keystrokeHub = this.initKeystrokeHub(uiContext);
		const keystrokeHubSetter = this.getKeystrokeHubSetter(
			uiContext,
			keystrokeHub
		);
		contextContainer.addEventListener("mouseover", keystrokeHubSetter);
	}
	/**
	 * Creates a symbol change filter and attaches it to the chart UI context and lookup
	 * containers.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 * @param {object} uiContext.config Configuration parameters.
	 * @param {object} [uiContext.config.onNewSymbolLoad] Contains two functions, `removeSeries`
	 * 		and `loadError`. Either or both functions can be omitted. See the
	 * 		{@tutorial Chart Configuration} tutorial for more information.
	 * @param {boolean} [uiContext.config.restore] Indicates whether to save and restore the chart
	 * 		layout, preferences, and drawings.
	 * @param {string} [uiContext.config.chartId] Identifies the chart.
	 * @param {object} [uiContext.config.selector] An assortment of CSS selectors used to obtain
	 * 		references to the DOM nodes that represent the chart elements named by the object
	 * 		properties.
	 * @param {function} [uiContext.config.lookupDriver] A function definition for the chart's
	 * 		default symbol [lookup driver]{@link CIQ.ChartEngine.Driver.Lookup}.
	 * @param {HTMLElement} uiContext.topNode The top node of the DOM tree for this context.
	 * 		Should contain all of the UI elements associated with the chart engine.
	 *
	 * @alias initLookup
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initLookup(uiContext) {
		const { config, topNode: contextContainer } = uiContext;
		this.initKeystrokeHub(uiContext);
		uiContext.changeSymbol = function (data, cb) {
			const { stx, loader } = uiContext;
			if (loader) loader.show();
			if (data.symbol == data.symbol.toLowerCase()) {
				data.symbol = data.symbol.toUpperCase(); // set a pretty display version
			}
			const { removeSeries, loadError } = config.onNewSymbolLoad || {};
			if (removeSeries) {
				Object.values(stx.chart.series)
					.filter(removeSeries)
					.forEach((series) => stx.removeSeries(series.id));
			}
			stx.loadChart(data, { masterData: data._masterData }, function (err) {
				if (loader) loader.hide();
				if (err) {
					if (loadError) loadError(err, uiContext);
					return;
				}
				if (cb) cb(stx);
				if (config.restore)
					CIQ.ChartEngine.restoreDrawings(
						stx,
						stx.chart.symbol,
						config.chartId
					);
			});
		};
		if (config.lookupDriver) {
			uiContext.setLookupDriver(new config.lookupDriver());
		}
	}
	/**
	 * Attaches a {@link CIQ.UI.KeystrokeHub} to the `body` element to enable users to start
	 * typing anywhere on the page to activate the chart's symbol input box.
	 *
	 * Modify this method to use a different tag, such as a `div`, if this behavior is too
	 * broad for your implementation.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 *
	 * @alias initKeystrokeHub
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initKeystrokeHub(uiContext) {
		if (document.body.keystrokeHub) {
			return document.body.keystrokeHub;
		}
		document.body.keystrokeHub = new CIQ.UI.KeystrokeHub(
			document.body,
			uiContext,
			{ cb: CIQ.UI.KeystrokeHub.defaultHotKeys }
		);
		return document.body.keystrokeHub;
	}
	/**
	 * Gets a callback that set the the active context of the keystroke hub based on the mouse
	 * pointer location.
	 *
	 * When multiple charts are on a page, the chart with the mouse pointer over it responds
	 * to keyboard input, such as shortcuts or symbol entry.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 * @param {CIQ.UI.KeystrokeHub} keystrokeHub A reference to the keystroke hub.
	 * @returns {Function} A callback that sets the active context of the keystroke hub.
	 *
	 * @alias getKeystrokeHubSetter
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	getKeystrokeHubSetter(uiContext, keystrokeHub) {
		return function setKeystrokeHub() {
			if (keystrokeHub.context === uiContext) {
				return;
			}
			keystrokeHub.setActiveContext(uiContext);
			qsa("cq-lookup").forEach((item) =>
				item.removeAttribute("cq-keystroke-default")
			);
			qs("cq-menu.ciq-search cq-lookup", uiContext.topNode).setAttribute(
				"cq-keystroke-default",
				""
			);
		};
	}
	/**
	 * Subscribes to the dialog channel.
	 *
	 * Creates an element for the requested dialog if one does not exist in the document scope.
	 * Opens the dialog in response to channel messages.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 *
	 * @alias initDialogHandler
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initDialogHandler(uiContext) {
		const { config: { channels = {}, dialogs = {} } = {}, stx } = uiContext;
		channelSubscribe(channels.dialog || "channel.dialog", handleDialog, stx);
		function handleDialog({ type = null, params = {} } = {}) {
			if (!type) {
				return;
			}
			const itemConfig = dialogs[type] || dialogs[CIQ.makeCamelCase(type)];
			if (!itemConfig) {
				return;
			}
			let el = qs(itemConfig.tag);
			if (!el) {
				// create and add to dialogs
				const dialogs = getDialogContainer();
				const dialogWrapper = document.createElement("cq-dialog");
				el = document.createElement(itemConfig.tag);
				Object.entries(itemConfig.attributes || {}).forEach(([name, value]) =>
					el.setAttribute(name, value)
				);
				dialogWrapper.append(el);
				dialogs.append(dialogWrapper);
			}
			if (el && el.open) {
				el.open(params);
			}
			function getDialogContainer() {
				let container = qs(".cq-dialogs");
				if (container) return container;
				container = document.createElement("div");
				container.classList.add("cq-dialogs");
				document.body.append(container);
				return container;
			}
		}
	}
	/**
	 * Subscribes to the drawing channel to manage drawing tool visibility based on channel
	 * messages.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 *
	 * @alias initDrawingTools
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initDrawingTools(uiContext) {
		const {
			stx,
			config: { channels = {} } = {},
			topNode: contextContainer
		} = uiContext;
		channelSubscribe(
			channels.drawing || "channel.drawing",
			setDrawingToolsAvailable,
			stx
		);
		function setDrawingToolsAvailable(value) {
			contextContainer.classList[value ? "add" : "remove"]("toolbar-on");
			stx.resizeChart();
		}
	}
	/**
	 * Creates a {@link CIQ.UI.DrawingEdit} helper and adds listeners to the helper. The
	 * listeners post messages in the drawing channel when drawing starts and ends.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 *
	 * @alias initDrawingEditListeners
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initDrawingEditListeners(uiContext) {
		const { config: { channels = {} } = {}, stx } = uiContext;
		const editHelper = new CIQ.UI.DrawingEdit(null, uiContext);
		let preventAutoClose = true;
		const drawingChannel = channels.drawing || "channel.drawing";
		editHelper.node.addEventListener(
			"drawing-edit-begin",
			function (event) {
				if (channelRead(drawingChannel, stx)) return;
				// if not already in drawing mode set it up so it closes on
				preventAutoClose = false;
				channelWrite(drawingChannel, true, stx);
			},
			false
		);
		editHelper.node.addEventListener(
			"drawing-edit-end",
			function ({ detail }) {
				if (preventAutoClose) return;
				if (detail.action !== "edit") preventAutoClose = true;
				if (detail.action !== "close") return;
				channelWrite(drawingChannel, false, stx);
			},
			false
		);
	}
	/**
	 * Creates and appends a [cq-color-picker]{@link WebComponents.cq-color-picker} component
	 * to the document body if one is not already attached.
	 *
	 * @alias initColorPicker
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initColorPicker() {
		const colorPicker = document.querySelector("cq-color-picker");
		if (colorPicker) return;
		document.body.append(document.createElement("cq-color-picker"));
	}
	/**
	 * Loads a chart with an initial symbol. When configured to restore the layout (which is
	 * the default), recreates the settings used in the previous session, including the last
	 * viewed symbol.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 * @param {CIQ.ChartEngine} uiContext.stx A reference to the chart engine.
	 * @param {HTMLElement} uiContext.topNode The top node of the DOM tree for this context.
	 * 		Should contain all of the UI elements associated with chart engine.
	 * @param {object} [uiContext.config] Configuration parameters.
	 * @param {string} [uiContext.config.chartId] Identifies the chart.
	 * @param {boolean} [uiContext.config.restore] Indicates whether to save and restore the chart
	 * 		layout, preferences, and drawings.
	 * @param {function} [uiContext.config.onChartReady] A callback function to call when the
	 * 		chart has loaded.
	 * @param {array} [uiContext.config.initialData] An array of
	 * 		[formatted objects]{@tutorial InputDataFormat} which provide the chart data.
	 * @param {CIQ.UI~Loader} [uiContext.loader] A web component instance that shows loading
	 * 		status.
	 *
	 * @alias loadChart
	 * @memberof CIQ.UI.Chart.prototype
	 * @since
	 * - 7.5.0
	 * - 8.2.0 Added the `config.onChartReady` and `config.initialData` parameters.
	 */
	loadChart(uiContext) {
		const {
			stx,
			topNode,
			config: {
				chartId,
				initialSymbol,
				restore,
				onChartReady,
				initialData
			} = {},
			loader
		} = uiContext;
		if (loader) loader.show();
		if (restore) {
			CIQ.ChartEngine.restorePreferences(stx, chartId || topNode.id);
			CIQ.ChartEngine.restoreLayout(
				stx,
				function () {
					if (loader) loader.hide();
					if (!stx.chart.symbol) {
						loadSymbol();
						return;
					}
					cbChartReady();
				},
				chartId
			);
		} else {
			loadSymbol();
		}
		function loadSymbol() {
			if (stx.crossSection) {
				stx.setChartType("crosssection");
			}
			if (!initialSymbol) {
				cbChartReady();
				return;
			}
			const data =
				typeof initialSymbol === "string"
					? { symbol: initialSymbol }
					: initialSymbol;
			data._masterData = initialData;
			// **Load an initial symbol. Change to null or one of your choice
			uiContext.changeSymbol(data, cbChartReady);
		}
		function cbChartReady() {
			if (!onChartReady) return;
			// execute configuration callback on next tick
			// as this function can be invoked synchronously, for example if there is no
			// symbol in layout and default symbol is not providing, leading to configuration
			// callback executed before call stack is cleard
			setTimeout(() => onChartReady(stx));
		}
	}
	/**
	 * Event handler for chart container size changes. Posts messages in the `breakpoint` and
	 * `containerSize` channels when the context container size has changed.
	 *
	 * Listening for container size changes in some browsers can be inefficient. This function
	 * improves notification efficiency by posting messages for specific changes, such as
	 * changes in responsive layout break points.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 *
	 * @alias notifySizeChanges
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	notifySizeChanges(uiContext) {
		const {
			stx,
			topNode: {
				clientWidth: width,
				clientHeight: height,
				classList: contextClasses
			},
			config: { channels = {} } = {}
		} = uiContext;
		// avoid notification if there are no changes in dimensions
		const previous = channelRead(
			channels.containerSize || "channel.containerSize",
			stx
		);
		if (
			// has been set and is the same dimensions
			previous &&
			previous.width === width &&
			previous.height === height
		) {
			return;
		}
		const breakpoint = this.getBreakpoint(width, height);
		if (!contextClasses.contains(breakpoint[1])) {
			channelWrite(
				channels.breakpoint || "channel.breakpoint",
				breakpoint[1],
				stx
			);
		}
		if (breakpoint[0] !== stx.chart.breakpoint) {
			// Move the second breakpoint channelWrite to the event queue so it doesn't immediately overwrite the first
			window.setTimeout(() =>
				channelWrite(
					channels.breakpoint || "channel.breakpoint",
					breakpoint[0],
					stx
				)
			);
			stx.notifyBreakpoint(breakpoint[0]);
		}
		channelWrite(
			channels.containerSize || "channel.containerSize",
			{ width, height },
			stx
		);
		stx.resizeChart();
	}
	/**
	 * Determines responsive design breakpoints based on numeric width and height values.
	 *
	 * Width breakpoints:
	 * - small &mdash; "break-sm"
	 * - medium &mdash; "break-md"
	 * - large &mdash; "break-lg"
	 *
	 * Height breakpoints:
	 * - small &mdash; "break-height-sm"
	 * - medium &mdash; "break-height-md"
	 * - large &mdash; "break-height-lg"
	 *
	 * @param {number} width The width in pixels for which a breakpoint is determined.
	 * @param {number} [height] The height in pixels for which a breakpoint is determined.
	 * @return {string|string[]} The width breakpoint if the optional `height` parameter is not
	 * 		provided; for example, "break-sm". If `height` is provided, returns an array
	 * 		containing the width breakpoint and height breakpoint; for example
	 * 		`["break-sm", "break-height-sm"]`.
	 *
	 * @alias getBreakpoint
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 * @since 8.2.1 Added the `height` parameter. Added the `string[]` type to the return value.
	 */
	getBreakpoint(width, height) {
		let breakWidth = "break-sm";
		if (width > 768) breakWidth = "break-lg";
		else if (width > 584) breakWidth = "break-md";
		// If no height is provided, return the single string.
		if (typeof height === "undefined") return breakWidth;
		let breakHeight = "break-height-sm";
		if (height > 768) breakHeight = "break-height-lg";
		else if (height > 400) breakHeight = "break-height-md";
		return [breakWidth, breakHeight];
	}
	/**
	 * Initiates event marker functionality.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 *
	 * @alias initEventMarkers
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initEventMarkers(uiContext) {
		const config = uiContext.config;
		if (CIQ.UI.Markers) {
			const implementation =
				config.eventMarkersImplementation &&
				new config.eventMarkersImplementation(uiContext.stx);
			const menuItemSelector = config.selector.markersMenuItem;
			new CIQ.UI.Markers(uiContext, { menuItemSelector, implementation });
		}
	}
	/**
	 * Installs plug-ins.
	 *
	 * See {@link CIQ.ChartEngine.create} for the installation of add-ons.
	 *
	 * @param {object} params Function parameters.
	 * @param {CIQ.ChartEngine} [params.stx] A reference to the chart engine.
	 * @param {CIQ.UI.Context} [params.uiContext] The chart user interface context.
	 * @param {object} [params.config] Contains the chart configuration, which includes a list of
	 * 		plug-ins.
	 * @param {string} [params.type] Type of extension. Currently, only "plugins" is supported.
	 *
	 * @alias initExtensions
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	initExtensions({ stx, uiContext, config, type }) {
		const collection = config[type];
		Object.entries(collection)
			.filter(([, params]) => !!params) // remove inactive addOns
			.forEach(([itemName, params]) => {
				const extensionName = params.moduleName || CIQ.capitalize(itemName);
				try {
					if (!CIQ[extensionName]) {
						if (CIQ.debug) {
							console.log(
								`${extensionName} not available for ${type} with params:`,
								params
							);
						}
						return;
					}
					const extensionParams = Object.assign(
						{ stx, context: uiContext },
						params
					);
					const extension = new CIQ[extensionName](extensionParams);
					CIQ.UI.activatePluginUI(stx, extensionName);
					if (params.postInstall) params.postInstall({ uiContext, extension });
				} catch (err) {
					if (CIQ.debug) {
						console.error(
							"Error configuring " + type + " using params ",
							params,
							"error",
							err
						);
					}
				}
			});
	}
	/* #region UI element setters  */
	/**
	 * Returns a setter function that updates the size of the side navigation panel by
	 * positioning the chart container `div`.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 * @returns {Function} A function that sets the size of the side navigation panel.
	 *
	 * @alias chartPositionSetter
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	chartPositionSetter(uiContext) {
		const chartContainer = qs(".chartContainer", uiContext.topNode);
		return function setSidenavSize(value) {
			if (!value) {
				return;
			}
			const { top, left } = value;
			chartContainer.style.marginTop = top + "px";
			chartContainer.style.marginLeft = left + "px";
		};
	}
	/**
	 * Returns a setter that updates the width of the side navigation panel by positioning the
	 * chart area (the HTML element that has the CSS class `ciq-chart-area`).
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 * @returns {Function} A function that sets the size of the side navigation panel.
	 *
	 * @alias sidenavSizeSetter
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	sidenavSizeSetter(uiContext) {
		const chartArea = qs(".ciq-chart-area", uiContext.topNode);
		const stx = uiContext.stx;
		return function setSidenavSize(value) {
			chartArea.style.left = value + "px";
			stx.resizeChart();
		};
	}
	/**
	 * Returns a setter that updates the top position of the chart area (the HTML element that
	 * has the CSS class `ciq-chart-area`) based on the height of the plug-ins panel.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 * @returns {Function} A function that sets the top position of the chart area.
	 *
	 * @alias chartAreaTopSetter
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	chartAreaTopSetter(uiContext) {
		const chartArea = qs(".ciq-chart-area", uiContext.topNode);
		// const { pluginPanelHeight } = uiContext.config.channels;
		// const height = (channel) => channelRead(channel, uiContext.stx) || 0;
		return function setTopHeight(value) {
			const top = Object.values(value || {}).reduce(
				(acc, item) => acc + item,
				0
			);
			chartArea.style.marginTop = top + "px";
			uiContext.stx.resizeChart();
		};
	}
	/**
	 * Returns a setter that updates the width of the side panel by setting the right position
	 * of the chart area (the HTML element that has the CSS class `ciq-chart-area`) and the
	 * right margin of the Analyst Views plug-in, `cq-analystviews`.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 * @returns {Function} A function that sets the width of the side panel.
	 *
	 *
	 * @alias sidepanelSizeSetter
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	sidepanelSizeSetter(uiContext) {
		const chartArea = qs(".ciq-chart-area", uiContext.topNode);
		const analystViews =
			qs("cq-analystviews", uiContext.topNode) ||
			qs("cq-tradingcentral", uiContext.topNode); // backwards compatibility
		const stx = uiContext.stx;
		return function setSidepanelSize(value) {
			chartArea.style.right = value + "px";
			if (analystViews) analystViews.style.marginRight = value + "px";
			stx.resizeChart();
		};
	}
	/**
	 * Returns a setter that updates the responsive break point of the top node of the chart
	 * user interface context.
	 *
	 * @param {CIQ.UI.Context} uiContext The chart user interface context.
	 * @returns {Function} A function that sets the responsive break point of the UI context.
	 *
	 * @alias breakpointSetter
	 * @memberof CIQ.UI.Chart.prototype
	 * @since 7.5.0
	 */
	breakpointSetter(uiContext) {
		return function setBreakpointClass(value) {
			const { classList: contextClasses } = uiContext.topNode;
			let breakpoints = [
				["break-lg", "break-md", "break-sm"], // width breakpoints
				["break-height-lg", "break-height-md", "break-height-sm"] // height breakpoints
			];
			breakpoints.forEach((breakpointGroup) => {
				if (breakpointGroup.includes(value))
					contextClasses.remove(...breakpointGroup);
			});
			uiContext.topNode.classList.add(value);
		};
	}
	/* #endregion */
}
CIQ.UI.Chart = Chart;
/**
 * Approximates a subset of jQuery functionality.
 *
 * This class exists to support jQuery-like methods within the existing web components.
 *
 * **Note:** New web components should be written using native accessors instead of the
 * undocumented methods of this class. The methods are designed for backward compatibility with
 * older code that used jQuery; they are not intended for direct API use.
 *
 * @name Faquery
 * @class
 * @since 8.1.0
 */
class Faquery {
	constructor(input, invalid) {
		if (invalid !== undefined)
			console.log("CIQ.UI.$() only accepts one input parameter.");
		let elements = [];
		if (input instanceof Faquery) return input;
		if (input instanceof Node) elements.push(input);
		else if (input instanceof NodeList) elements = Array.from(input);
		else if (input instanceof Array) elements = input;
		else if (typeof input === "string")
			elements = elements = Array.from(document.querySelectorAll(input));
		const length = (this.length = elements.length);
		for (let i = 0; i < length; i++) {
			this[i] = elements[i];
		}
	}
	_(func, selector) {
		const result = [];
		const insertFunc = (j) => {
			if (!selector || j.matches(selector)) {
				if (!result.includes(j)) result.push(j);
			}
		};
		for (let i = 0; i < this.length; i++) {
			const el = this[i];
			const newEl = Array.from(func(el));
			newEl.forEach(insertFunc);
		}
		return new Faquery(result);
	}
	addClass(classes) {
		if (typeof classes == "string") {
			classes = classes.split(" ");
		}
		classes.forEach((cls) =>
			this._((el) => {
				el.classList.add(cls);
				return [el];
			})
		);
		return this;
	}
	append(content, invalid) {
		if (typeof invalid !== "undefined")
			console.log("CIQ.UI.$#append only accepts one argument.");
		if (content instanceof Array) {
			for (let i = 0; i < content.length; i++) {
				this.append(content[i]);
			}
		} else if (typeof content === "string") {
			return this._((el) => {
				el[content[0] === "<" ? "innerHTML" : "innerText"] += content;
				return [el];
			});
		} else if (content instanceof HTMLElement || content instanceof Text) {
			const result = this._((el) => {
				el.appendChild(content.cloneNode(true));
				return [el];
			});
			const lastEl = result[result.length - 1];
			lastEl.replaceChild(content, lastEl.lastChild);
			return result;
		} else if (content instanceof Faquery) {
			return this.append(Array.from(content));
		}
		return this;
	}
	attr(nameOrObject, value) {
		if (typeof nameOrObject == "object") {
			return this._((el) => {
				Object.keys(nameOrObject).forEach((attr) =>
					el.setAttribute(attr, nameOrObject[attr])
				);
				return [el];
			});
		} else if (typeof value == "undefined") {
			if (!this[0]) return undefined;
			const attrib = this[0].getAttribute(nameOrObject);
			if (attrib === null) return undefined;
			return attrib;
		}
		return this._((el) => {
			el.setAttribute(nameOrObject, value);
			return [el];
		});
	}
	children(selector) {
		return this._((el) => el.children, selector);
	}
	css(nameOrObject, value) {
		if (typeof nameOrObject == "object") {
			return this._((el) => {
				Object.assign(el.style, nameOrObject);
				return [el];
			});
		} else if (typeof value == "undefined") {
			return this[0] ? getComputedStyle(this[0])[nameOrObject] : undefined;
		}
		return this._((el) => {
			el.style[nameOrObject] = value;
			return [el];
		});
	}
	each(func) {
		for (let i = 0; i < this.length; i++) func.call(this[i], i, this[i]);
		return this;
	}
	empty() {
		return this._((el) => {
			el.innerHTML = "";
			return [el];
		});
	}
	find(selector) {
		return selector
			? this._((el) => el.querySelectorAll(selector))
			: new Faquery([]);
	}
	hasClass(className) {
		return this._((el) => el.classList.contains(className) && [el]).length > 0;
	}
	hide() {
		return this._((el) => {
			if (el.style.display !== "none") {
				el.style.displayCache = el.style.display;
				el.style.display = "none";
			}
			return [el];
		});
	}
	html(value) {
		return this.prop("innerHTML", value);
	}
	nextAll(selector) {
		return this._((el) => {
			const children = Array.from(el.parentNode.children);
			return children.slice(children.indexOf(el) + 1);
		}, selector);
	}
	not(selector) {
		return this._((el) => !el.matches(selector) && [el]);
	}
	parent(selector) {
		return this._((el) => [el.parentNode], selector);
	}
	parents(selector) {
		return this._((el) => CIQ.climbUpDomTree(el.parentElement, selector));
	}
	prop(nameOrObject, value) {
		if (typeof nameOrObject == "object") {
			return this._((el) => {
				Object.keys(nameOrObject).forEach(
					(prop) => (el[prop] = nameOrObject[prop])
				);
				return [el];
			});
		} else if (typeof value == "undefined") {
			return this[0] ? this[0][nameOrObject] : undefined;
		}
		return this._((el) => {
			el[nameOrObject] = value;
			return [el];
		});
	}
	remove(selector) {
		Array.from(this).forEach((el) => {
			if (!selector || el.matches(selector)) el.parentNode.removeChild(el);
		});
		return this;
	}
	removeAttr(attributes) {
		if (typeof attributes == "string") {
			attributes = attributes.split(" ");
		}
		attributes.forEach((attr) =>
			this._((el) => {
				el.removeAttribute(attr);
				return [el];
			})
		);
		return this;
	}
	removeClass(classes) {
		if (typeof classes == "string") {
			classes = classes.split(" ");
		}
		if (classes)
			classes.forEach((cls) =>
				this._((el) => {
					el.classList.remove(cls);
					return [el];
				})
			);
		else
			this._((el) => {
				el.className = "";
				return [el];
			});
		return this;
	}
	show() {
		return this._((el) => {
			if (el.style.display === "none") {
				if (el.style.displayCache === undefined) el.style.display = "block";
				else {
					el.style.display = el.style.displayCache;
					el.style.displayCache = undefined;
				}
			}
			return [el];
		});
	}
	text(value) {
		return this.prop("innerText", value);
	}
	val(value) {
		return this.prop("value", value);
	}
}
/**
 * Wraps a node or node list in a jQuery object or {@link Faquery} object.
 *
 * If jQuery is enabled, performs `$()` on the argument and returns it. If jQuery is not enabled
 * or the `force` parameter is true, uses the {@link Faquery} emulator.
 *
 * @param {Node|NodeList} element Node or node list to be wrapped in a jQuery or {@link Faquery}
 * 		object.
 * @param {boolean} force If true, the function never uses jQuery, instead always uses
 * 		{@link Faquery}.
 * @returns {object} A jQuery object if jQuery is enabled and `force` is false; otherwise,
 * 		a {@link Faquery} object. The returned object wraps `element`.
 *
 * @memberof CIQ.UI
 * @since 8.1.0
 */
CIQ.UI.$ = function (element, force) {
	/* global $ */
	if (!force && typeof $ === "function" && $.fn) {
		if (!usingJquery) {
			console.log("Using jQuery.");
			usingJquery = true;
		}
		return $(element);
	}
	return new Faquery(element);
};
let usingJquery = false;
export { CIQ };
