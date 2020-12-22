// Copyright 2015-2016 by ChartIQ, Inc.


(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('./chartiq'),require('./thirdparty/object-observe'), require('./thirdparty/webcomponents-lite'));
	} else if (typeof define === "function" && define.amd) {
		define(['chartiq','thirdparty/object-observe', 'thirdparty/webcomponents-lite'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global, global, global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for componentUI.js.");
	}

})(function(_exports, oo, wc){
	var CIQ=_exports.CIQ;

	// node.stxtap([selector],callback)
	jQuery.fn.extend({
		stxtap: function(arg1, arg2) {
			return this.each(function() {
				CIQ.installTapEvent(this/*, {stopPropagation:true}*/);
				if(typeof arg1=="string"){
					$(this).on("stxtap", arg1, function(e){
						arg2.call(this, e);
					});
				}else{
					$(this).on("stxtap", function(e){
						arg1.call(this, e);
					});
				}
			});
		}
	});

	jQuery.fn.extend($.expr[':'], {
		trulyvisible: function(node, j, attr){
			var parents=$(node).parents();
			parents=parents.add(node);
			for(var i=0;i<parents.length;i++){
				var p=$(parents[i]);
				if(p.css("opacity") === "0" ) return false;
				if(p.css("visibility") === "hidden" ) return false;
				if(p.css("height") === "0px" ) return false;
				if(!p.is(":visible")) return false;
			}
			return true;
		}
	});

	/**
	 * Creates a virtual DOM and then compares contents before rendering. If the contents
	 * are the same then no rendering is done. This prevents flicker. React style.
	 */
	jQuery.fn.extend({
		cqvirtual: function(arg1){
			var virtual=this.clone();
			virtual.empty();
			virtual.original=this;
			return virtual;
		},
		cqrender: function(arg1){
			if(this[0].innerHTML==this.original[0].innerHTML) return this.original;
			this.original.empty();
			var children=this.children();
			if(children.length){
				var newStuff=children.detach();
				this.original.append(newStuff);
			}

			return this.original;
		},
		emptyExceptTemplate: function(){
			this.children().not("template").remove();
			return this;
		}
	});


	jQuery.queryString=function(sParam){
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++){
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam) return sParameterName[1];
		}
		return null;
	};


	/*
	 * http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
	 */

	(function(){
		var attachEvent = document.attachEvent;
		var isIE = navigator.userAgent.match(/Trident/);
		var requestFrame = (function(){
		var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
			function(fn){ return window.setTimeout(fn, 20); };
				return function(fn){ return raf(fn); };
			})();

		var cancelFrame = (function(){
			var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
			return function(id){ return cancel(id); };
		})();

		function resizeListener(e){
			var win = e.target || e.srcElement;
			if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
			win.__resizeRAF__ = requestFrame(function(){
				var trigger = win.__resizeTrigger__;
				trigger.__resizeListeners__.forEach(function(fn){
					fn.call(trigger, e);
				});
			});
		}

		function objectLoad(e){
			this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
			this.contentDocument.defaultView.addEventListener('resize', resizeListener);
		}

		/**
		 * Attaches a callback to listen for resize events on the DOM.
		 * @param {node} element
		 * @param {function} callback
		 * @memberof CIQ
		 */
		CIQ.addResizeListener = function(element, fn){
			var uiManager=$("cq-ui-manager");
			if(uiManager.length>0){
				uiManager=uiManager[0];
				uiManager.registerForResize(element);
			}
			if (!element.__resizeListeners__) {
				element.__resizeListeners__ = [];
				if (attachEvent) {
					element.__resizeTrigger__ = element;
					element.attachEvent('onresize', resizeListener);
				} else {
					//if (!getComputedStyle(element) || getComputedStyle(element).position == 'static') element.style.position = 'relative';
					var obj = element.__resizeTrigger__ = document.createElement('object');
					obj.setAttribute('style', 'visibility:hidden; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1; border:0px;');
					obj.__resizeElement__ = element;
					obj.onload = objectLoad;
					obj.type = 'text/html';
					if (isIE) element.appendChild(obj);
					obj.data = 'about:blank';
					if (!isIE) element.appendChild(obj);
				}
			}
			element.__resizeListeners__.push(fn);
		};

		/**
		 * Removes an attached a callback to listen for an element.
		 * @param {node} element
		 * @param {function} callback
		 * @memberof CIQ
		 */
		CIQ.removeResizeListener = function(element, fn){
			var uiManager=$("cq-ui-manager");
			if(uiManager.length>0){
				uiManager=uiManager[0];
				uiManager.unregisterForResize(element);
			}
			element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
			if (!element.__resizeListeners__.length) {
				if (attachEvent) element.detachEvent('onresize', resizeListener);
				else {
					element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
					element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
				}
			}
		};
	})();

	/**
	 * @typedef Selector
	 */

	/**
	 * @typedef HTMLElement
	 */

	/**
	 * Namespace for Web Components objects
	 *
	 * @see {@link CIQ.UI.ContextTag} which provides a model and base functionality for many components
	 * @namespace WebComponents
	 */
	 function WebComponents() {}

	/**
	 * Namespace for UI helper objects
	 * @namespace CIQ.UI
	 */
	CIQ.UI = {};

	/**
	 * @memberof CIQ.UI
	 */
	CIQ.UI.KEYSTROKE=1;

	/**
	 * @memberof CIQ.UI
	 */
	CIQ.UI.BODYTAP=2;

	CIQ.UI.Selectors=function(){};

	CIQ.UI.Selectors.noClose="[cq-no-close]";


	/**
	 * Convenience function for making a new jquery node from a HTML5 template
	 * @kind function
	 * @memberof CIQ.UI
	 * @param  {Selector} node Selector or HTMLElement
	 * @param {HTMLElement} [appendTo] If set, then the template will automatically be appended to this node.
	 * If appendTo==true then the new node will automatically be added in place (appended to the template's parent)
	 * @return {JQuery}      A jquery node
	 */
	CIQ.UI.makeFromTemplate=function(node, appendTo){
		var n=$(node)[0].content;
		var newNode=document.importNode(n, true);
		var jq = null;

		// find first real element
		// nodeType for element = 1
		// nodeType for text = 3
		for(var i=0; i<newNode.childNodes.length; i++){
			var child = newNode.childNodes[i];

			// found element
			if(child.nodeType == 1){
				jq=$(child);
				if(appendTo===true) $(node).parent().append(newNode);
				else if(appendTo) $(appendTo).append(newNode);
				break;
			}
		}

		return jq;
	};

	/**
	 * UI context helper class. Construct with an {@link CIQ.ChartEngine} object
	 * @param {CIQ.ChartEngine} stx The chart object to associate this UI
	 * @param {HTMLElement} topNode The top node of the DOM tree for this context. That node should contain
	 * all of the UI elements associated with the CIQ.ChartEngine
	 * @param {object} [params] Optional parameters
	 * @name CIQ.UI.Context
	 * @constructor
	 */
	CIQ.UI.Context=function(stx, topNode, params){
		this.params=params?params:{};
		this.stx=stx;
		this.topNode=$(topNode)[0];
		if(!this.topNode.CIQ) this.topNode.CIQ={};
		if(!this.topNode.CIQ.UI) this.topNode.CIQ.UI={};
		if(!this.topNode.CIQ.UI.Components) this.topNode.CIQ.UI.Components=[];
		if(!this.topNode.CIQ.UI.EventClaims) this.topNode.CIQ.UI.EventClaims=[];
		this.components=this.topNode.CIQ.UI.Components;
		this.topNode.CIQ.UI.context=this;
		// Search through all of the components that have registered themselves. Call setContext() on each
		// so that they can get their context. This usually initializes and makes the component active.
		for(var i=0;i<this.components.length;i++){
			this.components[i].setContextPrivate(this);
		}
	};

	/**
	 * Abstract method that should be overridden
	 * @param  {Object} data A symbol data object acceptible for {@link CIQ.ChartEngine#newChart}
	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.changeSymbol=function(data){
		console.log("Please implement CIQ.UI.Context.prototype.changeSymbol");
	};

	/**
	 * Sets the lookup driver for this context
	 * @param {CIQ.UI.Lookup.Driver} driver Lookup driver for cq-lookup component
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.setLookupDriver=function(driver){
		this.lookupDriver=driver;
	};


	/**
	 * Attaches an CIQ.UI helper to the context for future reference. Multiple helpers of the same type
	 * can be attached.
	 * @param {CIQ.UI.Helper} uiHelper A UI Helper to attach
	 * @param {string} className The classname of the element. For instance "Loader"
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.advertiseAs=function(uiHelper, className){
		var nd=$(this.topNode)[0];
		/*if(!nd.CIQ){
			nd.CIQ={};
			nd.CIQ.UI={};
		}*/
		if(!nd.CIQ.UI[className]){
			nd.CIQ.UI[className]=[];
		}
		nd.CIQ.UI[className].push(uiHelper);
	};


	/**
	 * Finds the nearest (parent) node that contains the class (CIQ.UI.Element type) referenced
	 * by an stxtap attribute. Returns null if none found.
	 * @param  {HTMLElement} node The element that was tapped
	 * @param  {string} helperName The type of UI Helper to look for
	 * @return {Array.CIQ.UI.Helper} The associated array of helpers or null if none found
	 * @memberof CIQ.UI.Context
	 * @private
	 */
	CIQ.UI.Context.prototype.findNearest=function(node, helperName){
		return this.topNode.CIQ.UI[helperName];
	/*
		var iterator=node;
		while(iterator.parentNode && iterator!=this.topNode){
			if(!iterator.CIQ || !iterator.CIQ.UI || !iterator.CIQ.UI[helperName]){
				iterator=iterator.parentNode;
				continue;
			}
			return iterator.CIQ.UI[helperName];
		}
		if(iterator.CIQ && iterator.CIQ.UI && iterator.CIQ.UI[helperName]) return iterator.CIQ.UI[helperName];
		return null;
		*/
	};

	/**
	 * Splits a string form function into function name and arguments
	 * @param  {string} cmd The string function call
	 * @return {object|null} Null or object containing helperName, functionName and args
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.splitMethod=function(cmd){
		if(!cmd) return null;
		var openParentheses=cmd.indexOf("(");
		var closeParentheses=cmd.lastIndexOf(")");
		if(openParentheses==-1 || closeParentheses==-1){
			console.log("malformed stxtap attribute: " + cmd);
			return null;
		}
		var helperName=null, functionName;
		var beforeParentheses=cmd.substring(0, openParentheses);
		var period=beforeParentheses.indexOf(".");
		if(period==-1){ // web component
			functionName=beforeParentheses;
		}else{
			helperName=beforeParentheses.substring(0,period);
			functionName=cmd.substring(period+1, openParentheses);
		}
		var args=cmd.substring(openParentheses+1, closeParentheses);
		var parsed=args.match(/('[^']+'|[^,]+)/g);
		var isFloat = new RegExp("^[0-9]+([,.][0-9]+)?$", "g");
		var isInteger = new RegExp("^\\d+$");
		var argArray = [];
		if(parsed){
			for(var i=0;i<parsed.length;i++){
				var arg=parsed[i];
				while(arg.charAt(0)==" ") arg=arg.substring(1);
				if(arg.indexOf('"')!=-1 || arg.indexOf("'")!=-1){
					argArray.push(arg.substring(1, arg.length-1));
				}else if(arg=="true"){
					argArray.push(true);
				}else if(arg=="false"){
					argArray.push(false);
				}else if(arg=="null"){
					argArray.push(null);
				}else if(isInteger.test(arg)){
					argArray.push(parseInt(arg,10));
				}else if(isFloat.test(arg)){
					argArray.push(parseFloat(arg));
				}else{
					var a=arg.split(".");
					var aObj=window;
					for(var b=0;b<a.length;b++){
						aObj=aObj[a[b]];
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
	 * Locates the nearest UI helper for the given attribute. If none exists then it is created at the topNode.
	 * @param  {HTMLElement} node    The node with either stxbind or stxtap attribute
	 * @param {string} [binding] The type of binding or helper name being looked for, otherwise the stxbind and then stxtap attributes are queried
	 * @param {string} attribute Either "stxtap" or "stxbind". Only required if binding==null.
	 * @return {CIQ.UI.Helper}     A UI helper object
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.getHelpers=function(node, binding, attribute){
		if(!node) node=this.topNode;
		else node=$(node)[0];
		if(!binding){
			binding=node.getAttribute(attribute);
			if(!binding) return null;
		}
		var helpers;
		var paren=binding.indexOf("(");
		var beforeParen=binding.substring(0, paren);
		var period=binding.indexOf(".");
		if(paren==-1 || beforeParen.indexOf(".")!=-1){ // Layout or Layout.Chart or Layout.Chart('blah')
			var helperName=binding;
			if(period!=-1){
				helperName=binding.substring(0, period);
			}
			helpers=this.findNearest(node, helperName);
			if(!helpers){
				if(!CIQ.UI[helperName]){
					console.log("Helper " + helperName + " not found");
					return null;
				}
				helpers=[new CIQ.UI[helperName](this.topNode, this)];
			}
		}else{ // bind to nearest web component // chart()
			var f=binding.substring(0, paren);
			var parents=$(node).parents();
			for(var i=0;i<parents.length;i++){
				var component=parents[i];
				if(typeof(component[f])=="function"){
					return [component];
				}
			}

		}
		return helpers;
	};

	/**
	 * Activates an element that was tapped on via the stxtap attribute. The contents of stxtap
	 * should be the name of a class derived from {@link CIQ.UI.Element}, a member function of that
	 * class and the arguments.
	 *
	 * The DOM tree will be searched for an instance of that class. If one cannot be found, then an
	 * instance will be created on the spot. The instance itself should attach itself if it wants to be re-used.
	 * @param  {HTMLElement} node The node that was tapped
	 * @param {Event} e The event that triggered the function
	 * @param {Object} [params] Optional object to send as last argument
	 * @param {Boolean} [setter] If true then use stxsetget instead of stxtap
	 * @memberof CIQ.UI.Context
	 * @private
	 */
	CIQ.UI.Context.prototype.activate=function(node, e, params, setter){
		var attribute=setter?"stxsetget":"stxtap";
		var method=CIQ.UI.Context.splitMethod(node.getAttribute(attribute));
		if(!method) return;
		var helperName=method.helperName;
		var f=method.functionName;
		if(setter) f="set" + f;
		// All helper methods take the node that was activated as the first argument
		var argArray=[{node:node,e:e,params:params}].concat(method.args);

		if(helperName){
			var helpers=this.getHelpers(node, null, attribute);

			for(var i=0;i<helpers.length;i++){
				if(!helpers[i][f]){
					console.log("Method '" + f + "' not found in helper", helpers[i]);
					continue;
				}
				helpers[i][f].apply(helpers[i], argArray);
			}
		}else{
			var parents=$(node).parents();
			for(var j=0;j<parents.length;j++){
				var component=parents[j];
				if(typeof(component[f])==="function"){
					component[f].apply(component, argArray);
				}
			}
		}
	};

	/**
	 * We need to attach a safeClickTouch
	 * @param  {HTMLElement}   node The element to attach a tap event to
	 * @param  {Function} cb   The callback when tapped
	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.makeTap=function(node, cb){
		node.selectFC=cb;
		$(node).stxtap(cb);
	};

	CIQ.UI.Context.prototype.inputEntry=function(node, cb){
		$(node).on("keypress", function(e){
			switch(e.which){
				case 13:
				case 9:
					cb();
			}
		});
	};

	/**
	 * Creates a simple tappable observable based on a stxbindtap attribute with the following syntax.
	 * object.member=condition,action=value // set object.member to condition and execute the action when clicked (radio button)
	 * object.member~=condition,action=value // toggle object.member condition and execute the action when clicked (checkbox)
	 * object.member,action=value            // toggle object.member boolean and execute action when true
	 * object.member==condition,action=value // check but do not set object.member condition and execute the action when clicked
	 * @param  {HTMLElement} node Selector or html element
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.makeBindTap=function(node){
		function splitLHS(lhs){
			var o={};
			var s=lhs.split("==");
			if(s.length==2){
				o.objectString=s[0];
				o.condition=s[1];
				o.verb="evaluate";
				return o;
			}
			s=lhs.split("~=");
			if(s.length==2){
				o.objectString=s[0];
				o.condition=s[1];
				o.verb="checkbox";
				return o;
			}
			s=lhs.split("=");
			if(s.length==2){
				o.objectString=s[0];
				o.condition=s[1];
				o.verb="radio";
				return o;
			}
			o.objectString=lhs;
			o.condition=null;
			o.verb="boolean";
		}
		var bindtap=node.getAttribute("stxbindtap");
		var params={
			selector:node
		};
		// Parse the attribute into params
		var comma=bindtap.indexOf(",");
		var lhs=bindtap.substring(0, comma);
		var rhs=bindtap.substring(comma+1);

		$.extend(params,splitLHS(lhs));

		var eq=rhs.indexOf("=");
		params.action=eq==-1?rhs:rhs.substring(0,eq);
		params.value=eq==-1?null:rhs.substring(eq+1);

		var objectChain=params.objectString.split(".");
		params.obj=this;
		for(var i=0;i<objectChain.length-1;i++){
			params.obj=params.obj[objectChain[i]];
		}
		params.member=objectChain[i];
		this.observe(params); // binding

		// tapping
		var self=this;
		function closure(params){
			return function(e){
				self.e=e;
				if(params.verb==="evaluate"){
					//no op
				}else if(params.verb==="radio"){
					params.obj[params.member]=params.condition;
				}else if(params.verb=="checkbox"){
					if(params.obj[params.member]===params.condition) params.obj[params.member]=null;
					else params.obj[params.member]=params.condition;
				}else if(params.verb=="boolean"){
					params.obj[params.member]=!params.obj[params.member];
				}
			};
		}
		this.makeTap(node, closure(params));

	};
	/**
	 * Set bindings for a node that has been created dynamically. The attribute can be either "stxbind", "stxtap" or "stxsetget".
	 *
	 * In the case of stxsetget, a "set" and "get" will be prepended to the bound method.
	 * <Helper>.getXxxxx() will be called once during this initialization. That method should set up a binding.
	 *
	 * When tapping (or changing value in the case of an input field) <Helper>.setXxxx() will be called.
	 *
	 * bindings in web components will search for the nearest parent component that contains the expected function:
	 * @example
	 * stxtap="tool('gartley')" // Will look for the next parent with method "tool"
	 *
	 * To explicitly target a web component, use a prefix
	 * @example
	 * stxtap="DrawingToolbar.tool('gartley')"
	 *
	 * Then be sure to register the web component
	 * @example
	 * CIQ.UI.advertiseAs(this, this, "DrawingToolbar");
	 *
	 * To bind an action to a class that is not a webcomponent
	 * @example
	 * CIQ.UI.advertiseAs(node, class instance, "DrawingToolbar");
	 *
	 * @param  {HTMLElement} node      The node to bind
	 * @param {Object} [params] Optional parameters that will be passed as final argument
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.bind=function(node, params){
		node=$(node)[0]; // If jquery, convert to raw HTMLElement
		var helpers;
		var binding=node.getAttribute("stxbind");
		var tap=node.getAttribute("stxtap");
		var bindtap=node.getAttribute("stxbindtap");
		var setget=node.getAttribute("stxsetget");

		function bindHelper(helper){
			var method;
			var paren=binding.indexOf("(");
			if(paren==-1){
				method=binding.substring(binding.indexOf(".")+1);
			}else{
				method=binding.substring(0, paren);
			}
			helper[method](node);
		}
		if(binding && binding!==""){
			helpers=this.getHelpers(node, binding, "stxbind");
			helpers.forEach(bindHelper);
		}
		var self=this;
		function closure(node){
			return function(e){
				self.e=e;
				self.activate(node, e, params, false);
			};
		}
		if(tap && tap!==""){
			this.makeTap(node, closure(node));
		}

		if(bindtap){
			this.makeBindTap(node);
		}
		function setGetHelper(helper){
			function createSetter(){
				return function(e){
					self.e=e;
					self.activate(node, e, params, true);
				};
			}
			var method=CIQ.UI.Context.splitMethod(setget);
			if(!method){
				console.log("Syntax error " + setget);
				return;
			}
			var argArray=[node].concat(method.args).concat(params);
			helper["get" + method.functionName].apply(helper, argArray);
			if(node.type==="text" || node.type==="number"){
				self.inputEntry(node, createSetter());
			}else{
				self.makeTap(node, createSetter());
			}
		}
		if(setget){
			helpers=this.getHelpers(node, setget, "stxsetget");
			helpers.forEach(setGetHelper);
		}
	};

	/**
	 * Travels the DOM tree and locates stxbind attributes. UI elements can use these to configure menus or dialogs.
	 * To effect reverse binding, set the value of the stxbind attribute to a Helper class name and data element. For instance "Layout.chartStyle".
	 * The Helper element will seek out all children with "stxtap" attribution and examine the arguments to that function call for a match.
	 * @param {HTMLElement} [traverseNode] Specify the node to traverse. Defaults to topNode for the context.
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.buildReverseBindings=function(traverseNode){
		if(!traverseNode) traverseNode=this.topNode;
		var acceptFunc=function(node) {
			if ( node.hasAttribute("stxbind") ||
				node.hasAttribute("stxtap") ||
				node.hasAttribute("stxbindtap") ||
				node.hasAttribute("stxsetget")) {
				return NodeFilter.FILTER_ACCEPT;
			}
		};

		var walker = document.createNodeIterator(
			traverseNode,
			NodeFilter.SHOW_ELEMENT,
			CIQ.isIE?acceptFunc:{acceptNode:acceptFunc},
			false
		);

		var node;
		//var binding, helpers, node;
		/*function bindHelper(helper){
			var method=binding.substring(binding.indexOf(".")+1);
			helper[method](node);
		}*/

		node = walker.nextNode();
		while(node) {
			this.bind(node);
			//binding=node.getAttribute("stxbind");
			//helpers=this.getHelpers(node, binding, "stxbind");

			//helpers.forEach(bindHelper);

			node = walker.nextNode();
		}
	};

	/**
	 * Attaches a loader to a UI context
	 * @param {CIQ.UI.Loader} loader Loader instance
	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.setLoader=function(loader){
		this.loader=loader;
	};

	/**
	 * Is the context in modal mode?
	 * @return {Boolean} true if in modal mode
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.isModal=function(){
		return (this.stx.openDialog!=="");
	};
	/**
	 * Claim any keystrokes that come in. Once claimed, any keystrokes
	 * that come in will be passed to the helper. It can then choose
	 * to capture or propagate the keystrokes. This allows a helper to capture
	 * keystrokes even if it doesn't have mouse focus.
	 * @param {CIQ.UI.Helper} helper A helper of ContextTag
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.addClaim=function(helper, eventType){
		var claims=this.topNode.CIQ.UI.EventClaims;
		claims.push({helper: helper, eventType:eventType});
	};

	/**
	 * Remove a claim on keystrokes.
	 * @param  {CIQ.UI.Helper} helper Helper or ContextTag
 	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.removeClaim=function(helper, eventType){
		var claims=this.topNode.CIQ.UI.EventClaims;
		for(var i=0;i<claims.length;i++){
			if(claims[i].helper===helper && claims[i].eventType===eventType){
				claims.splice(i,1);
				return;
			}
		}
	};

	/**
	 * @param hub
	 * @param key
	 * @param e Event
	 * @param keystroke
	 * @memberof CIQ.UI.Context
	 */
	CIQ.UI.Context.prototype.processKeyStrokeClaims=function(hub, key, e, keystroke){
		var claims=this.topNode.CIQ.UI.EventClaims;
		for(var i=claims.length-1;i>-1;i--){
			if(claims[i].eventType!==CIQ.UI.KEYSTROKE) continue;
			var helper=claims[i].helper;
			var response=helper.keyStroke(hub, key, e, keystroke);
			if(response){
				if(!response.allowDefault) e.preventDefault();
				return true;
			}
		}
		return false;
	};

	/**
	 * Create an observable
	 * @param  {Object} params Parameters
	 * @param {string} [params.selector] The selector to effect the observable (adding class, setting value)
	 * @param {Object} params.obj The object to observe
	 * @param {string} [params.member] The member of the object to observe. Pass an array to observe multiple members. Or pass nothing to observe any change to the object.
	 * @param {string} [params.condition] Optional condition for the member to trigger the action
	 * @param {string} params.action The action to take. "class" - add or remove a class. "callback" - calls back with params
	 * @param {string} params.value The value for the action (i.e. class name, callback function)
	 * @memberof CIQ.UI.Context
	 *
	 * @example - Add or remove a class based on whether stx.layout.crosshair is true or false
	 * context.observe({selector:".toggle", obj:stx.layout, member:"crosshair", action:"class", value:"active"});

	 * @example - Add or remove a class based on whether stx.layout.chartType=="candle"
	 * context.observe({selector:".toggle", obj:stx.layout, member:"chartType", condition:"candle", action:"class", value:"active"});

	 * @example - Get a callback from a change in value
	 * context.observe({selector:".toggle", obj:stx.layout, member:"chartType", condition:"candle", action:"callback", value:function(params){
	 *    console.log("new value is" + params.obj[params.member]);
	 * }});

	 */
	CIQ.UI.Context.prototype.observe=function(params){
		var self=this;
		function observed(change) {
			var match=false;
			if(!params.member){ // wildcard
				match=true;
			}else if(change.name===params.member){
				match=true;
			}else if(params.member.constructor == Array){
				for(var i=0;i<params.member.length;i++){
					if(change.name===params.member[i]) match=true;
				}
			}
			if(match){
				var nodes=$(params.selector);
				if(!nodes.length && params.action==="callback"){ // simple callback not associated with a selector
					params.value.call(self, params);
					return;
				}
				if(params.action==="class") nodes.removeClass(params.value);
				nodes.each(function(){
					var isTrue=false;
					if(params.member){
						if(params.condition){
							if(params.obj[params.member]===params.condition) isTrue=true;
						}else{
							isTrue=params.obj[params.member];
						}
					}
					if(params.action==="class"){
						if(isTrue) nodes.addClass(params.value);
					}
					if(params.action==="callback"){
						params.value.call(self, params, this);
					}
					if(params.action==="value"){
						if(params.value){
							this.value=params.value;
						}else{
							if(!params.obj[params.member])
								this.value="";
							else
								this.value=params.obj[params.member];
						}
					}
				});
			}
		}

		Object.observe(params.obj, function(changes){changes.forEach(observed);}, ["update","add","delete"]);
		observed({name:params.member}); // initialize
	};

	/**
	 * Convenience function to display the changing price of a node
	 * @kind function
	 * @memberof CIQ.UI
	 * @param {node} node
	 * @param {number} newPrice
	 * @param {number} oldPrice
	 */
	CIQ.UI.animatePrice=function(node, newPrice, oldPrice){
		node.removeClass("cq-stable");
		if(newPrice>oldPrice) node.addClass("cq-up");
		else if(newPrice<oldPrice) node.addClass("cq-down");
		setTimeout(function(){
			node.addClass("cq-stable").removeClass("cq-up").removeClass("cq-down");
		},0);
	};

	/**
	 * Abstract class for WebComponents that use a {@link CIQ.UI.Context}
	 *
	 * Provides a base set of functionality for web components
	 *
	 * @see {@link WebComponents}
	 * @memberof CIQ.UI
	 * @namespace ContextTag
	 * @type {HTMLElement}
	 */
	CIQ.UI.ContextTag=Object.create(HTMLElement.prototype);

	/**
	 * Stores the component in the contextHolder so that when the context
	 * is started it knows that this tag is contextual
	 * @kind function
	 * @memberof CIQ.UI.ContextTag
	 */
	CIQ.UI.ContextTag.setContextHolder=function(){
		var contextHolder=this.node.parents("cq-context,*[cq-context]")[0];
		if(!contextHolder.CIQ) contextHolder.CIQ={};
		if(!contextHolder.CIQ.UI) contextHolder.CIQ.UI={};
		if(!contextHolder.CIQ.UI.Components) contextHolder.CIQ.UI.Components=[];
		if(!contextHolder.CIQ.UI.EventClaims) contextHolder.CIQ.UI.EventClaims=[];
		contextHolder.CIQ.UI.Components.push(this);

		// This should only get called for components that are generated dynamically, after a context
		// has already been established
		if(contextHolder.CIQ.UI.context) this.setContextPrivate(contextHolder.CIQ.UI.context);
	};

	/**
	 * This is called for every registered component when the context is constructed. You can override
	 * this as an initialization.
	 * @kind function
	 * @memberof CIQ.UI.ContextTag
	 * @param {CIQ.UI.Context} context The context
	 */
	CIQ.UI.ContextTag.setContext=function(context){
		// override me
	};

	/**
	 * @kind function
	 * @memberof CIQ.UI.ContextTag
	 * @param {CIQ.UI.Context} context The context
	 */
	CIQ.UI.ContextTag.setContextPrivate=function(context){
		this.context=context;
		this.uiManager=$("cq-ui-manager");
		if(this.uiManager.length>0) this.uiManager=this.uiManager[0];

		var node=$(this);
		if(typeof(node.attr("cq-marker"))!="undefined"){
			node.detach();
			this.marker=new CIQ.Marker({
				stx: context.stx,
				node: node[0],
				xPositioner:"none",
				yPositioner:"none",
				permanent:true
			});
		}
		setTimeout(function(s,c){return function(){s.setContext(c);};}(this,context));
	};

	/**
	 * Executes a function in the nearest parent component (container). For instance, a cq-close tag might call "close"
	 * on its containing component
	 * @memberof CIQ.UI
	 * @param {object} self
	 * @param  {string} fn   The name of the function
	 * @param  {Array}   args Arguments array (a "spread" is also supported)
	 */
	CIQ.UI.containerExecute=function(self, fn, args){
		var myArgs=args;
		if(args && myArgs.constructor!==Array) myArgs=Array.prototype.slice.call(arguments, 2);
		var parents=self.node.parents();
		for(var i=0;i<parents.length;i++){
			var parent=parents[i];
			if(parent[fn] && parent[fn].constructor==Function){
				return parent[fn].apply(parent, myArgs);
			}
		}
		return null;
	};

	/**
	 * Convience function that creates an array of injections for the component and sets a variable of node equal to self.
	 * @kind function
	 * @memberof CIQ.UI.ContextTag
	 */
	CIQ.UI.ContextTag.createdCallback=function(){
		this.injections=[];
		this.node=$(this);
	};

	/**
	 *
	 * @kind function
	 * @memberof CIQ.UI.ContextTag
	 * @param {string} position Where in the animation loop the injection should be added. Append or Prepend.
	 * @param {string} injection What function to add the injection too
	 * @param {function} code The callback to fired when the injection occurs
	 */
	CIQ.UI.ContextTag.addInjection=function(position, injection, code){
		this.injections.push(this.context.stx[position](injection,code));
	};

	/**
	 * Removes all the the injections for a context tag and resets the tag to its default state
	 * @kind function
	 * @memberof CIQ.UI.ContextTag
	 */
	CIQ.UI.ContextTag.detachedCallback=function(){
		if(this.context && this.injections){
			for(var i=0;i<this.injections.length;i++){
				this.context.stx.removeInjection(this.injections[i]);
			}
			this.injections=[];
		}
	};

	/**
	 * Called automatically when a tag is instantiated
	 * @private
	 */
	CIQ.UI.ContextTag.attachedCallback=function(){
		if(this.attached) return;
		this.node=$(this);
		this.setContextHolder();
		this.attached=true;
	};

	/**
	 * A tag that is modally aware of the chart
	 *
	 * Inherits {@link CIQ.UI.ContextTag}
	 * @namespace CIQ.UI.ModalTag
	 * @memberof CIQ.UI
	 */
	CIQ.UI.ModalTag = Object.create(CIQ.UI.ContextTag);

	/**
	 *
	 * @kind function
	 * @memberof CIQ.UI.ModalTag
	 */
	CIQ.UI.ModalTag.modalBegin = function(){
		if(!this.context) return;
		this.context.stx.modalBegin();
	};

	/**
	 *
	 * @kind function
	 * @memberof CIQ.UI.ModalTag
	 */
	CIQ.UI.ModalTag.modalEnd = function(){
		if(!this.context) return;
		this.context.stx.modalEnd();
	};

	/**
	 *
	 * @kind function
	 * @memberof CIQ.UI.ModalTag
	 */
	CIQ.UI.ModalTag.attachedCallback=function(){
		if(this.attached) return;
		var node=$(this);
		var self=this;
		node.mouseover(function(){
			self.modalBegin();
		});
		node.mouseout(function(){
			self.modalEnd();
		});
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
	};


	/**
	 * Abstract class for UI Helpers
	 * @name CIQ.UI.Helper
	 * @constructor
	 */
	CIQ.UI.Helper=function(node, context){
		this.node=node;
		this.context=context;
		this.injections=[]; // To keep track of injections for later removal
	};

	/**
	 * Adds an injection. These will be automatically destroyed if the helper object is destroyed
	 * @param {string} position  "prepend" or "append"
	 * @param {string} injection The injection name. i.e. "draw"
	 * @param {Function} code      The code to be run
	 * @memberof CIQ.UI.Helper
	 */
	CIQ.UI.Helper.prototype.addInjection=function(position, injection, code){
		this.injections.push(this.context.stx[position](injection,code));
	};

	/**
	 * Removes injections from the ChartEngine
	 * @memberof CIQ.UI.Helper
	 */
	CIQ.UI.Helper.prototype.destroy=function(){
		for(var i=0;i<this.injections.length;i++){
			this.context.stx.removeInjection(this.injections[i]);
		}
		this.injections=[];
	};

	/**
	 * @constructor CIQ.UI.Lookup
	 */
	CIQ.UI.Lookup=function(){};


	/**
	 * Base class that drives the lookup widget. You should derive your own Driver that interacts with your datafeed.
	 * @name  CIQ.UI.Lookup.Driver
	 * @constructor
	 */
	CIQ.UI.Lookup.Driver=function(){};

	/**
	 * Abstract method, override this to accept the selected text and optional filter. Fetch results
	 * and return them by calling this.cb This default driver returns no results.
	 * @param  {string} text The text entered by the user
	 * @param {string} [filter] The optional filter text selected by the user. This will be the innerHTML of the cq-filter element that is selected.
	 * @memberof CIQ.UI.Lookup.Driver
	 */
	CIQ.UI.Lookup.Driver.prototype.acceptText=function(text, filter){
		if(!this.cb) return;
	};

	/**
	 * An example of an asynchronous Lookup.Driver that uses ChartIQ's suggestive search as its source for symbol search
	 * @memberof CIQ.UI.Lookup.Driver
	 * @param {array} exchanges An array of ecxchanges that can be searched against
	 */
	CIQ.UI.Lookup.Driver.ChartIQ=function(exchanges){
		this.exchanges=exchanges;
		if(!this.exchanges) this.exchanges=["XNYS","XASE","XNAS","XASX","INDCBSX","INDXASE","INDXNAS","IND_DJI","ARCX","INDARCX","forex"];
		this.url="https://symbols.chartiq.com/chiq.symbolserver.SymbolLookup.service";
		this.requestCounter=0;  //used to invalidate old requests
		//t=ibm&m=10&x=[]&e=STOCKS
	};

	/**
	 * An example instance of the Lookup Driver scoped to CIQ.UI.Lookup.Driver
	 *
	 * Inherits all of the base Look Driver's properties via `ciqInheritsFrom()`
	 * @name ChartIQ
	 * @memberof CIQ.UI.Lookup.Driver
	 */
	CIQ.UI.Lookup.Driver.ChartIQ.ciqInheritsFrom(CIQ.UI.Lookup.Driver);

	/**
	 * @memberof CIQ.UI.Lookup.Driver.ChartIQ
	 * @param {string} text Text to serach for
	 * @param {string} filter Any filter to be applied to the search results
	 * @param {number} maxResults Max number of results to return from the server
	 * @param {function} cb Callback upon results
	 */
	CIQ.UI.Lookup.Driver.ChartIQ.prototype.acceptText=function(text, filter, maxResults, cb){
		if(filter=="FX") filter="FOREX";
		if(isNaN(parseInt(maxResults, 10))) maxResults=100;
		var url=this.url+"?t=" + encodeURIComponent(text) + "&m="+maxResults+"&x=[";
		if(this.exchanges){
			url+=this.exchanges.join(",");
		}
		url+="]";
		if(filter && filter.toUpperCase()!="ALL"){
			url+="&e=" + filter;
		}

		var counter=++this.requestCounter;
		var self=this;
		function handleResponse(status, response){
			if(counter<self.requestCounter) return;
			if(status!=200) return;
			try{
				response=JSON.parse(response);
				var symbols=response.payload.symbols;

				var results=[];
				for(var i=0;i<symbols.length;i++){
					var fields=symbols[i].split('|');
					var item={
						symbol: fields[0],
						name: fields[1],
						exchDisp: fields[2]
					};
					results.push({
						display:[item.symbol, item.name, item.exchDisp],
						data:item
					});
				}
					cb(results);
			}catch(e){}
		}
		CIQ.postAjax({url: url, cb: handleResponse});
	};

	/**
	 * UI helper for StudyMenu UI element.
	 * @param {HTMLElement} node The node where the study menu will be drawn
	 * @param {CIQ.UI.Context} context The context
	 * @param {Object} params Optional parameters to control behavior of the menu
	 * @param {Object} [params.excludedStudies] A map of study names that should not be put in the menu.
	 * @param {Boolean} [params.alwaysDisplayDialog=false] If set to true then, the study will automatically be added to the chart, but a dialog will also always be displayed to allow the end user to pick their study parameters. Otherwise the study will be created automatically with defaults. Can optionally be an object containing a map of which studys to always display the dialog for.
	 * @param {Boolean} [params.dialogBeforeAddingStudy=false] If set to true then a dialog will be displayed before the study is added to the chart. This can optionally be a map of which studies require a dialog before adding.
	 * @param {string} [params.template=".stxTemplate"] Optionally specify a selector to use as a template for making the menu
	 * @name CIQ.UI.StudyMenu
	 * @constructor
	 */
	CIQ.UI.StudyMenu=function(node, context, params){
		this.node=$(node);
		this.context=context;
		this.params=params?params:{};
		if(!this.params.template) this.params.template=".stxTemplate";
		this.params.template=this.node.find(this.params.template);
		this.params.template.detach();
		this.alwaysDisplayDialog=this.params.alwaysDisplayDialog?this.params.alwaysDisplayDialog:false;
		this.excludedStudies=this.params.excludedStudies;
		if(!this.excludedStudies) this.excludedStudies=[];
		context.advertiseAs(this, "StudyMenu");
	};
	CIQ.UI.StudyMenu.ciqInheritsFrom(CIQ.UI.Helper);

	/**
	 * Creates the menu. You have the option of coding a hardcoded HTML menu and just using
	 * CIQ.UI.StudyMenu for processing stxtap attributes, or you can call renderMenu() to automatically
	 * generate the menu.
	 * @memberOf CIQ.UI.StudyMenu
	 */
	CIQ.UI.StudyMenu.prototype.renderMenu=function(){
		var alphabetized=[];
		var sd;
		for(var field in CIQ.Studies.studyLibrary){
			sd=CIQ.Studies.studyLibrary[field];
			if(!sd.name) sd.name=field; // Make sure there's always a name
			if(this.excludedStudies[field] || this.excludedStudies[sd.name]) continue;
			alphabetized.push(field);
		}
		alphabetized.sort(function(lhs, rhs){
			var lsd=CIQ.Studies.studyLibrary[lhs];
			var rsd=CIQ.Studies.studyLibrary[rhs];
			if(lsd.name<rsd.name) return -1;
			if(lsd.name>rsd.name) return 1;
			return 0;
		});
		var menu=$(this.node);
		var self=this;
		var tapFn=function(studyName, context){
			return function(e){
				self.pickStudy(e.target, studyName);
				menu.resize();
			};
		};
		for(var i=0;i<alphabetized.length;i++){
			var menuItem=this.params.template.clone();
			sd=CIQ.Studies.studyLibrary[alphabetized[i]];
			menuItem.append(sd.name);
			menu.append(menuItem);
			menuItem[0].selectFC=tapFn(alphabetized[i], this.context);
			menuItem.stxtap(menuItem[0].selectFC);
		}
	};

	/**
	 * Pops up a study dialog for the given study
	 * @memberof CIQ.UI.StudyMenu
	 */
	CIQ.UI.StudyMenu.prototype.studyDialog=function(params){
		$("cq-study-dialog").each(function(){
			this.configure(params);
		});
	};

	/**
	 * Called when the user clicks on a study in the study menu. Depending on the state of
	 * this.alwaysDisplayDialog, this will either create a study dialog or it will create the study itself.
	 * @param  {HTMLElement} node      The node that was clicked on
	 * @param  {string} studyName The name of the study (entry in studyLibrary)
	 * @memberOf CIQ.UI.StudyMenu
	 */
	CIQ.UI.StudyMenu.prototype.pickStudy=function(node, studyName){
		var stx=this.context.stx;
		var self=this;

		function handleSpecialCase(flag, params){
			if(flag===true){
				self.studyDialog(params);
				return true;
			}else if(typeof flag==="object"){
				for(var i in flag){
					if(i==studyName && flag[i]){
						self.studyDialog(params);
						return true;
					}
				}
			}

		}

		if(handleSpecialCase(this.params.dialogBeforeAddingStudy, {stx: stx, name: studyName})) return;
		var sd=CIQ.Studies.addStudy(stx, studyName);
		handleSpecialCase(this.alwaysDisplayDialog, {sd: sd, stx: stx});
	};

	/**
	 * UI helper for ViewsMenu UI element.
	 *
	 * @param {HtmlElement} node The node where the views menu will be drawn
	 * @param {CIQ.UI.Context} context The context
	 * @param {Object} params Optional parameters to control behavior of the menu
	 * @param {Object} [params.viewObj={views:[]}] Specify the object which contains the "views" objects.  If omitted, will create one.
	 * @param {Object} [params.nameValueStore=CIQ.NameValueStore] Specify the storage class.  If omitted, will use NameValueStore.
	 * @param {Object} [params.renderCB=null] Optional callback executed on menu after rendering.  Takes the menu as argument.
	 * @name CIQ.UI.ViewsMenu
	 * @constructor
	 */
	CIQ.UI.ViewsMenu=function(node, context, params){
		this.node=$(node);
		this.params=params?params:{};
		if(!this.params.viewObj) this.params.viewObj={views:[]};
		if(!this.params.nameValueStore) this.params.nameValueStore=new CIQ.NameValueStore();
		if(!this.params.template) this.params.template="template[cq-view]";
		this.params.template=this.node.find(this.params.template);
		this.params.template.detach();
		this.context=context;
		this.uiManager=$("cq-ui-manager");
		if(this.uiManager.length>0) this.uiManager=this.uiManager[0];
		var self=this;
		this.params.nameValueStore.get("stx-views", function(err,obj){
			if(!err && obj) self.params.viewObj.views=obj;
		});
		context.advertiseAs(this, "ViewsMenu");
	};

	CIQ.UI.ViewsMenu.ciqInheritsFrom(CIQ.UI.Helper);

	/**
	 * Creates the menu. You have the option of coding a hardcoded HTML menu and just using
	 * CIQ.UI.ViewsMenu for processing stxtap attributes, or you can call renderMenu() to automatically
	 * generate the menu.
	 * @memberof CIQ.UI.ViewsMenu
	 */
	CIQ.UI.ViewsMenu.prototype.renderMenu=function(){
		var menu=$(this.node);
		var self=this;
		var stx=self.context.stx;

		function remove(i){
			return function(e){
				e.stopPropagation();
				self.params.viewObj.views.splice(i,1);
				self.params.nameValueStore.set("stx-views",self.params.viewObj.views);
				self.renderMenu();
			};
		}

		function enable(i){
			return function(e){
				e.stopPropagation();
				self.uiManager.closeMenu();
				if(self.context.loader) self.context.loader.show();
				var layout=CIQ.first(self.params.viewObj.views[i]);
				function importLayout(){
					stx.importLayout(self.params.viewObj.views[i][layout], true, true);
					if(stx.changeCallback) stx.changeCallback(stx, "layout");
					stx.dispatch("layout",{stx:stx});
					if(self.context.loader) self.context.loader.hide();
				}
				setTimeout(importLayout,10);
			};
		}

		$("cq-views-content cq-item").remove();
		for(var v=0;v<this.params.viewObj.views.length;v++){
			var view=CIQ.first(self.params.viewObj.views[v]);
			if(view=="recent") continue;
			var item=CIQ.UI.makeFromTemplate(this.params.template);
			var label=item.find("cq-label");
			var removeView=item.find("div");

			if(label.length) {
				label.addClass("view-name-"+view);
				label.text(view);
			}
			if(removeView.length) removeView.stxtap(remove(v));
			item.stxtap(enable(v));
			$("cq-views-content").append(item);
		}

		var addNew=$("cq-view-save");
		if(addNew){
			addNew.stxtap(function(e){
				var viewDialog=self.context.getHelpers(null, "ViewDialog");
				if(!viewDialog.length){
					console.log("CIQ.UI.ViewsMenu.prototype.renderMenu: no ViewDialog available");
					return;
				}
				viewDialog=$(viewDialog[0]);
				var input=viewDialog.find("input");
				input.val("");
				viewDialog.parents("cq-dialog")[0].open();
			});
		}
		if(this.params.renderCB) this.params.renderCB(menu);
	};

	/**
	 * A Heads up marker for displaying OHLC values on the chart.
	 *
	 * @name CIQ.Marker.HeadsUp
	 * @inheritdoc CIQ.Marker
	 * @constructor
	 * @param {object} params
	 * @param showClass
	 */
	CIQ.Marker.HeadsUp=function(params, showClass){
		if(!this.className) this.className="CIQ.Marker.HeadsUp";
		CIQ.Marker.call(this, params);
		this.prevTick=null;
		this.showClass=showClass;
	};

	CIQ.Marker.HeadsUp.ciqInheritsFrom(CIQ.Marker, false);

	/**
	 * Determines the location of the HeadsUp Marker.
	 *
	 * @memberof CIQ.Marker.HeadsUp
	 * @param {object} params
	 */
	CIQ.Marker.HeadsUp.placementFunction = function(params) {
		var panel = params.panel;
		var chart = panel.chart;
		var stx = params.stx;
		var useHighs = CIQ.ChartEngine.chartShowsHighs(stx.layout.chartType);
		if(!params.showClass) params.showClass="stx-show";

		for (var i = 0; i < params.arr.length; ++i) {

			var marker = params.arr[i];
			var node = $(marker.node);
			if (marker.params.x < 0 || marker.params.x >= chart.dataSet.length) {
				node.removeClass(params.showClass);
				return;
			}
			if (stx.layout.crosshair || stx.currentVectorParameters.vectorType) {
				node.removeClass(params.showClass);
				return;
			}
			var quote = chart.dataSet[marker.params.x];
			var x = stx.pixelFromTick(marker.params.x);
			if (!quote || x<chart.left || x > chart.right) {
				node.removeClass(params.showClass);
				return;
			}
			node.addClass(params.showClass);

			if (!marker.clientWidth)
				marker.clientWidth = node.width();
			if (!marker.clientHeight)
				marker.clientHeight = node.height();
			if (marker.clientWidth > x) {
				node.removeClass("stx-left");
				node.addClass("stx-right");
				node.css({
					"left" : x + "px",
					"right" : "auto"
				});
			} else {
				node.addClass("stx-left");
				node.removeClass("stx-right");
				node.css({
					"right" : (stx.chart.canvasWidth - x) + "px",
					"left" : "auto"
				});
			}

			var bottom;
			var containerHeight = marker.params.chartContainer ? stx.chart.canvasHeight : panel.bottom;
			if (useHighs) {
				bottom = getBottomPixel(stx, panel, containerHeight, stx.getBarBounds(quote).high);
			} else {
				bottom = getBottomPixel(stx, panel, containerHeight, quote[stx.chart.defaultPlotField]);
			}
			// Keep below top of screen
			var top = containerHeight - bottom - marker.clientHeight + stx.top;
			if (top < 0) {
				node.addClass('stx-below');
				bottom = ( useHighs ? getBottomPixel(stx, panel, containerHeight, stx.getBarBounds(quote).low) : bottom) - marker.clientHeight;
			} else {
				node.removeClass('stx-below');
			}

			var bottomPX = bottom + "px";

			if (marker.node.style.bottom != bottomPX) {
				marker.node.style.bottom = bottomPX;
			}
		}
	};


	function getBottomPixel(stx, panel, containerHeight, price) {
		//begin widget change
		if(!panel || !panel.chart) return; //sanity check
		var pixel;
		if(panel.chart.isComparison){
			pixel=Math.round(containerHeight - stx.pixelFromPriceTransform(price, panel));
		}
		else{
			pixel=Math.round(containerHeight - stx.pixelFromPrice(price, panel));
		}
		return pixel;
		//end widget change
	}


	/**
	 * UI Helper that keeps the "head's up" display operating. There are three modes:
	 * params.followMouse=true - The head's up display will follow the mouse
	 * params.staticNode=true - The head's up will simply update a DOM node managed by you
	 * default - The head's up will be a marker within the chart, positioned in the chart panel unless overidden
	 *
	 * @param {HtmlElement} node The node which should be the template for the head's up.
	 * @param {CIQ.UI.Context} context The context
	 * @param {Object} [params] Optional parameters
	 * @param {Boolean} [autoStart=true] If true then start the head's up on construction
	 * @param {boolean} [followMouse=false] If true then the head's up will follow the mouse. In this case, the node should be a template
	 * that will be removed from the document and then added dynamically into the chart container.
	 * @param {Boolean} [staticNode=false] If true then the node will not be added as a marker
	 * @param {string} [showClass="stx-show"] The class that will be added to display the head's up
	 * @name CIQ.UI.HeadsUp
	 * @constructor
	 */
	CIQ.UI.HeadsUp=function(node, context, params){
		this.params=params?params:{};
		if(typeof this.params.autoStart=="undefined") this.params.autoStart=true;
		this.node=$(node);
		this.node.detach();
		this.context=context;
		this.maxVolume={lastCheckDate:null, value:0};	// This contains the maximum volume in the dataSet, used to generate the volume icon element
		context.advertiseAs(this, "HeadsUp");
		if(this.params.autoStart) this.begin();
	};

	CIQ.UI.HeadsUp.ciqInheritsFrom(CIQ.UI.Helper);

	/**
	 * Begins the head's up operation. This uses injections to manage the contents and location of the display. See {@link CIQ.UI.HeadsUp#end} to stop
	 * the head's up.
	 * @memberof CIQ.UI.HeadsUp
	 */
	CIQ.UI.HeadsUp.prototype.begin=function(){
		var params;
		if(this.params.followMouse){
			this.node.css({"top":"auto"}); // allow style.bottom to override the default top value
			params={
				stx:this.context.stx,
				label: "headsup",
				xPositioner: "bar",
				chartContainer: true,
				x:0,
				node:this.node[0]
			};
			this.marker=new CIQ.Marker.HeadsUp(params, this.params.showClass);
			//this.node.addClass(this.params.showClass);

			this.addInjection("append", "handleMouseOut", function(self){ return function(){
				self.followMouse(-1);
			};}(this));
			if(CIQ.touchDevice){
				this.context.stx.touchNoPan=true; // on touch devices, the dynamic head's up moves like a crosshair
			}
		}else if(this.params.staticNode){

		}else{
			this.node.css({"top":"", "left":""}); // Remove any existing styles
			params={
				stx:this.context.stx,
				label: "headsup",
				xPositioner: "none",
				chartContainer: false,
				node:this.node[0]
			};
			$.extend(params, this.params); // Override default marker setup by passing marker parameters into CIQ.UI.HaedsUp
			this.marker=new CIQ.Marker(params);
			//this.node.addClass(this.params.showClass);
		}
		this.calculateMaxVolume();
		this.addInjection("prepend","headsUpHR", function(self){ return function(){self.position();};}(this));
		this.addInjection("append","createXAxis", function(self){ return function(){self.position();};}(this));
		this.addInjection("append","createDataSet", function(self){ return function(dontRoll, whichChart, params){self.calculateMaxVolume(params.appending);};}(this));
	};

	/**
	 * Stops the head's up from operating by removing injections and hiding. You can start it again by calling {@link CIQ.UI.HeadsUp#begin}.
	 * @memberOf CIQ.UI.HeadsUp
	 */
	CIQ.UI.HeadsUp.prototype.end=function(){
		if(CIQ.touchDevice && this.params.followMouse){
			this.context.stx.touchNoPan=false;
		}
		if(this.marker) this.marker.remove();
		this.destroy();
		this.marker=null;
	};

	/**
	 * @memberof CIQ.UI.HeadsUp
	 * @param {boolean} appending
	 */
	CIQ.UI.HeadsUp.prototype.calculateMaxVolume=function(appending){
		if(!appending) this.maxVolume={lastCheckDate:null, value:0};
		var dataSet=this.context.stx.chart.dataSet;
		if(!dataSet || !dataSet.length) return;
		for(var i=dataSet.length-1;i>=0;i--){
			var q=dataSet[i];
			if(q.DT<this.maxVolume.lastCheckDate) break;
			if(q.Volume>this.maxVolume.value) this.maxVolume.value=q.Volume;
		}
		this.maxVolume.lastCheckDate=dataSet[dataSet.length-1].DT;
	};

	/**
	 * Determines information inside of the HeadsUp display based on position.
	 * @memberof CIQ.UI.HeadsUp
	 * @private
	 */
	CIQ.UI.HeadsUp.prototype.position=function(){
		var stx=this.context.stx;
		var bar=stx.barFromPixel(stx.cx);
		this.tick=stx.tickFromPixel(stx.cx);
		var prices=stx.chart.xaxis[bar];
		var currentQuote=stx.chart.currentQuote;
		var plotField=stx.chart.defaultPlotField;
		if(!plotField || CIQ.ChartEngine.chartShowsHighs(stx.layout.chartType)) plotField="Close";

		var node=this.node;
		var self=this;
		function printValues(){
			self.timeout=null;
			node.find("cq-hu-price").text("");
			node.find("cq-hu-open").text("");
			node.find("cq-hu-close").text("");
			node.find("cq-hu-high").text("");
			node.find("cq-hu-low").text("");
			node.find("cq-hu-date").text("");
			node.find("cq-hu-volume").text("");
			node.find("cq-volume-rollup").text("");
			if(prices){
				if(prices.data){
					node.find("cq-hu-open").text(stx.formatPrice(prices.data.Open));
					node.find("cq-hu-price").text(stx.formatPrice(prices.data[plotField]));
					node.find("cq-hu-close").text(stx.formatPrice(prices.data.Close));
					node.find("cq-hu-high").text(stx.formatPrice(prices.data.High));
					node.find("cq-hu-low").text(stx.formatPrice(prices.data.Low));

					var volume=CIQ.condenseInt(prices.data.Volume);
					var rollup=volume.charAt(volume.length-1);
					if(rollup>'0'){
						volume=volume.substring(0,volume.length-1);
						node.find("cq-volume-rollup").text(rollup.toUpperCase());
					}
					node.find("cq-hu-volume").text(volume);
					var tickDate = prices.data.displayDate;
					if (!tickDate) tickDate = prices.data.DT;
					if (CIQ.ChartEngine.isDailyInterval(stx.layout.interval)){
						node.find("cq-hu-date").text(CIQ.mmddyyyy(CIQ.yyyymmddhhmm(tickDate)));
					} else {
						node.find("cq-hu-date").text(CIQ.mmddhhmm(CIQ.yyyymmddhhmm(tickDate)));
					}
					var visuals=node.find("cq-volume-visual");
					if(visuals.length){
						var relativeCandleSize=self.maxVolume.value?prices.data.Volume/self.maxVolume.value:0;
						visuals.css({"width":Math.round(relativeCandleSize*100)+"%"});
					}
				}
				if(currentQuote && currentQuote[plotField] && self.tick==stx.chart.dataSet.length-1){
					node.find("cq-hu-price").text(stx.formatPrice(currentQuote[plotField]));
				}
			}
		}
		if(this.tick!=this.prevTick || (stx.chart.dataSegment && bar==stx.chart.dataSegment.length-1)){
			if(this.timeout) clearTimeout(this.timeout);
			var ms=this.params.followMouse?0:0; // IE and FF struggle to keep up with the dynamic head's up.
			this.timeout=setTimeout(printValues, ms);
		}
		this.prevTick=this.tick; // We don't want to update the dom every pixel, just when we cross into a new candle
		if(this.params.followMouse){
			if(stx.openDialog) this.tick=-1;  // Turn off the headsup when a modal is on
			this.followMouse(this.tick);
		}
	};

	CIQ.UI.HeadsUp.prototype.followMouse=function(tick){
		this.marker.params.x=tick;
		var self=this;
		self.marker.render();
	};


	/**
	 * UI Helper for managing study interaction, editing, deleting etc. It sets up
	 * {@link CIQ.ChartEngine.callbacks#studyOverlayEdit} and {@link CIQ.ChartEngine.callbacks#studyPanelEdit} callbacks
	 * in order to display a dialog for editing study parameters and a context menu for editing or deleting overlays.
	 * @name CIQ.UI.StudyEdit
	 * @param {HTMLElement} [node=context.topNode] Automatically attaches to the top node of the context
	 * @param {CIQ.UI.Context} context The context for the chart
	 * @param {HTMLElement} [contextDialog] The context dialog to use
	 * @constructor
	 */
	CIQ.UI.StudyEdit=function(node, context, contextDialog){
		this.context=context;
		this.node=node?node:context.topNode;

		if(contextDialog){
			this.contextDialog=$(contextDialog)[0];
		}
		context.advertiseAs(this, "StudyEdit");
		this.initialize();
	};

	CIQ.UI.StudyEdit.ciqInheritsFrom(CIQ.UI.Helper);

	/**
	 * Closes Study Edit dialog.
	 * @memberof CIQ.UI.StudyEdit
	 */
	CIQ.UI.StudyEdit.prototype.remove=function(){
		CIQ.Studies.removeStudy(this.params.stx, this.params.sd);
		this.contextDialog.close();
	};

	/**
	 * Proxy for editing a study. Assumes the params for the study have already been set.
 	 * @memberof CIQ.UI.StudyEdit
	 */
	CIQ.UI.StudyEdit.prototype.edit=function(){
		this.contextDialog.close();
		this.editPanel(this.params);
	};

	/**
	 * This just finds the StudyDialog web component and proxies the parameters
	 * over to it
	 * @memberof CIQ.UI.StudyEdit
	 * @param  {Object} params Parameters from studyPanelEdit callback
	 */
	CIQ.UI.StudyEdit.prototype.editPanel=function(params){
		$("cq-study-dialog").each(function(){
			this.configure(params);
		});
	};

	/**
	 * Displays the context dialog for studies and saves the parameters for editing
 	 * @memberof CIQ.UI.StudyEdit
	 * @param  {Object} params Parameters from studyOverlayEdit callback
	 */
	CIQ.UI.StudyEdit.prototype.editOverlay=function(params){
		this.params=params;
		if(params.forceEdit){
			this.editPanel(params);
		}else{
			this.contextDialog.open({x:CIQ.ChartEngine.crosshairX, y:CIQ.ChartEngine.crosshairY});
		}
	};

	/**
	 * Creates the callbacks for self and the context.
	 * @memberof CIQ.UI.StudyEdit
	 */
	CIQ.UI.StudyEdit.prototype.initialize=function(){
		var stx=this.context.stx;
		var self=this;

		function closure(fc){
			return function(){
				fc.apply(self, arguments);
			};
		}
		stx.callbacks.studyOverlayEdit=closure(self.editOverlay);
		stx.callbacks.studyPanelEdit=closure(self.editPanel);
	};

	/**
	 * UI Helper for Layout changes, for instance tapping items on the display menu. This Helper
	 * is also responsible for initializing menu items in the "display" menu based on the chart layout (CIQ.ChartEngine#layout)
	 * @name CIQ.UI.Layout
	 * @param {HTMLElement} node The node to associate the Layout with
	 * @param {CIQ.UI.Context} context The context
	 * @param {Object} [params] Parameters
	 * @param {string} [params.activeClassName="ciq-active"] The class name to be added to a node when a layout item is enabled
	 * @constructor
	 */
	CIQ.UI.Layout=function(node, context, params){
		this.params=params?params:{};
		if(!this.params.activeClassName) this.params.activeClassName="ciq-active";
		this.node=node;
		this.context=context;
		context.advertiseAs(this, "Layout");
	};

	CIQ.UI.Layout.ciqInheritsFrom(CIQ.UI.Helper);

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} chartType
	 */
	CIQ.UI.Layout.prototype.getChartType=function(node, chartType){
		var activeClassName=this.params.activeClassName;
		// A little complexity here to consolidate two fields (aggregationType and chartType) into one
		// set of radio buttons
		function showChartType(params, node){
			var layout=params.obj;
			if(layout.aggregationType && layout.aggregationType!="ohlc"){
				if(chartType!==layout.aggregationType){
					$(node).removeClass(activeClassName);
				}else{
					$(node).addClass(activeClassName);
				}
			}else{
				if(chartType!==layout.chartType){
					$(node).removeClass(activeClassName);
				}else{
					$(node).addClass(activeClassName);
				}
			}
		}
		this.context.observe({
			selector: node,
			obj: this.context.stx.layout,
			member: ["chartType","aggregationType"],
			action: "callback",
			value: showChartType
		});
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} chartType
	 */
	CIQ.UI.Layout.prototype.setChartType=function(node, chartType){
		var aggregations={
			"heikinashi":true,
			"kagi":true,
			"linebreak":true,
			"pandf":true,
			"rangebars":true,
			"renko":true
		};
		if(aggregations[chartType]){
			this.context.stx.setChartType("candle");
			this.context.stx.setAggregationType(chartType);
		}else{
			this.context.stx.setChartType(chartType);
			this.context.stx.setAggregationType(null);
		}
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} chartScale
	 */
	CIQ.UI.Layout.prototype.getChartScale=function(node, chartScale){
		this.context.observe({
			selector: node,
			obj: this.context.stx.layout,
			member: "chartScale",
			condition: chartScale,
			action: "class",
			value: this.params.activeClassName
		});
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} chartType
	 */
	CIQ.UI.Layout.prototype.setChartScale=function(node, chartScale){
		if(this.context.stx.layout.chartScale==chartScale){
			this.context.stx.setChartScale(null);
		}else{
			this.context.stx.setChartScale(chartScale);
		}
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 */
	CIQ.UI.Layout.prototype.getExtendedHours=function(node){
		this.context.observe({
			selector: node,
			obj: this.context.stx.layout,
			member: "extended",
			condition: true,
			action: "class",
			value: this.params.activeClassName
		});
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 */
	CIQ.UI.Layout.prototype.setExtendedHours=function(node){
		var stx=this.context.stx;
		stx.layout.extended=!stx.layout.extended;
		stx.changeOccurred("layout");

		if(stx.extendedHours){
			var loader=this.context.loader;
			if(loader) loader.show();
			stx.extendedHours.set(stx.layout.extended,null,function(){
				loader.hide();
			});
		}
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 */
	CIQ.UI.Layout.prototype.getRangeSlider=function(node){
		this.context.observe({
			selector: node,
			obj: this.context.stx.layout,
			member: "rangeSlider",
			condition: true,
			action: "class",
			value: this.params.activeClassName
		});
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 */
	CIQ.UI.Layout.prototype.setRangeSlider=function(node){
		var stx=this.context.stx;
		stx.layout.rangeSlider=!stx.layout.rangeSlider;
		if(stx.slider) stx.slider.display(stx.layout.rangeSlider);
		stx.changeOccurred("layout");
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} aggregationType
	 */
	CIQ.UI.Layout.prototype.getAggregationType=function(node, aggregationType){
		this.context.observe({
			selector: node,
			obj: this.context.stx.layout,
			member: "aggregationType",
			condition: aggregationType,
			action: "class",
			value: this.params.activeClassName
		});
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} aggregationType
	 */
	CIQ.UI.Layout.prototype.setAggregationType=function(node, aggregationType){
		if(this.context.stx.layout.aggregationType==aggregationType){
			this.context.stx.setAggregationType(null);
		}else{
			this.context.stx.setAggregationType(aggregationType);
		}
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} field
	 */
	CIQ.UI.Layout.prototype.getAggregationEdit=function(node, field){
		var stx=this.context.stx;
		function populateEditField(params){
			var name=params.selector.name;
			var value=params.obj[params.member];
			if(!value && stx.chart.defaultChartStyleConfig[name]){
				$(params.selector).val(stx.chart.defaultChartStyleConfig[name]);
			}else{
				$(params.selector).val(value);
			}
		}

		var tuple=CIQ.deriveFromObjectChain(stx.layout, field);
		this.context.observe({
			selector: node,
			obj: tuple.obj,
			member: tuple.member,
			action: "callback",
			value: populateEditField
		});
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} field
	 */
	CIQ.UI.Layout.prototype.setAggregationEdit=function(node, field){
		var stx=this.context.stx;
		if(field==="auto"){
			if(stx.layout.aggregationType==="kagi"){
				stx.layout.kagi=null;
			}else if(stx.layout.aggregationType==="renko"){
				stx.layout.renko=null;
			}else if(stx.layout.aggregationType==="linebreak"){
				stx.layout.priceLines=null;
			}else if(stx.layout.aggregationType==="rangebars"){
				stx.layout.range=null;
			}else if(stx.layout.aggregationType==="pandf"){
				if(!stx.layout.pandf){
					stx.layout.pandf={box:null, reversal:null};
				}
				stx.layout.pandf.box=null;
				stx.layout.pandf.reversal=null;
			}
		}else{
			var tuple=CIQ.deriveFromObjectChain(stx.layout, field);
			tuple.obj[tuple.member]=$(node.node).val();
		}
		stx.changeOccurred("layout");
		stx.createDataSet();
		stx.draw();
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {string} aggregationType
	 */
	CIQ.UI.Layout.prototype.showAggregationEdit=function(node, aggregationType){
		var stx=this.context.stx;
		var map={
			kagi:{
				title:"Set Reversal Percentage"
			},
			renko:{
				title:"Set Range"
			},
			linebreak:{
				title:"Set Price Lines"
			},
			rangebars:{
				title:"Set Range"
			},
			pandf:{
				title:"Set Point & Figure Parameters"
			}
		};
		if(stx.layout.aggregationType!=aggregationType)
			stx.setAggregationType(aggregationType);
		if(!this.aggregationDialog){
			console.log("Error:  Layout.aggregationDialog must reference your dialog for editing aggregation parameters");
			return;
		}
		var dialog=$(this.aggregationDialog);
		var entry=map[aggregationType];
		dialog.find(".title").text(stx.translateIf(entry.title));

		for(var type in map){
			dialog.find(".ciq" + type).css(aggregationType===type?{display:""}:{display:"none"});
		}
		dialog.find(".ciq" + aggregationType + " input").each(function(){
			var name=this.name;
			if(name=="box" || name=="reversal") name="pandf."+name;
			var tuple=CIQ.deriveFromObjectChain(stx.layout, name);
			if(tuple && !tuple.obj[tuple.member] && stx.chart.defaultChartStyleConfig[this.name])
				$(this).val(stx.chart.defaultChartStyleConfig[this.name]);
		});

		dialog[0].open();
	};

	/**
	 * Removes all studies ffrom the top most node
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 */
	CIQ.UI.Layout.prototype.clearStudies=function(node){
		var stx=this.context.stx;
		for(var id in stx.layout.studies){
			var sd=stx.layout.studies[id];
			if(!sd.customLegend) CIQ.Studies.removeStudy(stx, sd);
		}
		stx.draw();
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node
	 * @param {number} periodicity
	 * @param {number} interval
	 * @param {number} timeUnit
	 */
	CIQ.UI.Layout.prototype.setPeriodicity=function(node, periodicity, interval, timeUnit){
		var self=this;
		if(self.context.loader) self.context.loader.show();
		if(isNaN(interval)) {
			if(!timeUnit) timeUnit=interval;
			interval=1;
		}
		self.context.stx.setPeriodicity({period:periodicity, interval:interval, timeUnit:timeUnit}, function(){
			if(self.context.loader) self.context.loader.hide();
		});
	};

	/**
	 * Sets the display periodicity. Usually this is called from an observer that is in CIQ.UI.Layout#periodicity.
	 *
	 * @param  {CIQ.ChartEngine} stx    The chart object to examine for periodicity
	 * @param  {Object} params Parameters
	 * @param {HTMLElement} params.selector The selector to update
	 */
	CIQ.UI.Layout.prototype.showPeriodicity=function(stx, params){
		var text="";
		if(stx.layout.interval=="day"){
			text=stx.layout.periodicity+"D";
		}else if(stx.layout.interval=="week"){
			text=stx.layout.periodicity+"W";
		}else if(stx.layout.interval=="month"){
			text=stx.layout.periodicity+"M";
		}else if(stx.layout.interval=="tick"){
			text=stx.layout.periodicity+"T";
		}else if(stx.layout.timeUnit=="second"){
			text=stx.layout.periodicity+"s";
		}else if(stx.layout.timeUnit=="millisecond"){
			text=stx.layout.periodicity+"ms";
		}else if(stx.layout.interval*stx.layout.periodicity>=60 &&
				(stx.layout.interval*stx.layout.periodicity)%15===0){
			text=(stx.layout.interval*stx.layout.periodicity)/60+"H";
		}else{
			text=stx.layout.interval*stx.layout.periodicity+"m";
		}
		$(params.selector).empty().append(CIQ.translatableTextNode(stx,text));
	};

	CIQ.UI.Layout.prototype.periodicity=function(node){
		var self=this;
		function showPeriodicity(params){
			self.showPeriodicity(this.stx, params);
		}
		this.context.observe({
			selector: node,
			obj: this.context.stx.layout,
			member: ["interval","periodicity","timeUnit"],
			action: "callback",
			value: showPeriodicity
		});
	};

	/**
	 * Populates and displays the timezone widget
	 * @memberof CIQ.UI.Layout
	 */
	CIQ.UI.Layout.prototype.displayTimezone=function(){

		var dialog=$("cq-timezone-dialog");
		var ul=dialog[0].querySelector("ul");
		var template=ul.querySelector("li#timezoneTemplate").cloneNode(true);
		var button = dialog[0].querySelector(".ciq-btn");

		$(ul).empty();
		ul.appendChild(template);
		for(var key in CIQ.timeZoneMap){
			var zone=key;
			var display=zone;
			var li=template.cloneNode(true);
			li.style.display="block";
			li.innerHTML=display;
			CIQ.safeClickTouch(li,setTimezone(zone));
			ul.appendChild(li);
		}
		var stxx=this.context.stx;
		var currentUserTimeZone=dialog[0].querySelector("#currentUserTimeZone");
		if( stxx.displayZone ) {
			var fullZone = stxx.displayZone;
			for(var tz in CIQ.timeZoneMap){
				if( CIQ.timeZoneMap[tz] === stxx.displayZone ) fullZone = tz;
			}
			currentUserTimeZone.innerHTML='Current TimeZone is '+fullZone;
			$(button).show();
		} else {
			currentUserTimeZone.innerHTML='Your timezone is your current location';
			$(button).hide();
		}

		function setTimezone(zone){
			return function(e){
				$(dialog).closest("cq-dialog,cq-menu").each(function(){
					this.close();
				});
				var translatedZone=CIQ.timeZoneMap[zone];
				CIQ.ChartEngine.defaultDisplayTimeZone=translatedZone;
				for(var i=0;i<CIQ.ChartEngine.registeredContainers.length;i++){
					var stx=CIQ.ChartEngine.registeredContainers[i].stx;
					stx.setTimeZone(stx.dataZone, translatedZone);
					if(stx.chart.symbol) stx.draw();
				}
			};
		}

		$(dialog).closest("cq-dialog,cq-menu").each(function(){
			this.open();
		});
	};

	/**
	 * Removes the currently selected timezone for the chart
	 * @memberof CIQ.UI.Layout
	 */
	CIQ.UI.Layout.prototype.removeTimezone=function(){
		CIQ.ChartEngine.defaultDisplayTimeZone=null;
		for(var i=0;i<CIQ.ChartEngine.registeredContainers.length;i++){
			var stx=CIQ.ChartEngine.registeredContainers[i].stx;
			stx.displayZone=null;
			stx.setTimeZone();

			if(stx.displayInitialized) stx.draw();
		}

		$("cq-timezone-dialog").closest("cq-dialog,cq-menu").each(function(){
			this.close();
		});
	};


	/**
	 * UI Helper for capturing and handling keystrokes. cb to capture the key. Developer is responsible
	 * for calling e.preventDefault() and/or e.stopPropagation();
	 *
	 * @name CIQ.UI.Keystroke
	 * @param {HTMLElement} [node] The node to which to attach, generally the chart container
	 * @param {Function} [cb] Callback when key pressed
	 * @constructor
	 */
	CIQ.UI.Keystroke=function(node, cb){
		this.node=$(node);
		this.cb=cb;
		this.initialize();
		this.shift=false;
		this.ctrl=false;
		this.cmd=false;
		this.capsLock=false;
		this.downValue=""; // Android Chrome bug requires a workaround for keyup.
	};

	/**
	 * Set this to true to bypass key capture. Shift, CTRL, CMD will still be toggled however
	 * @memberof CIQ.UI.Keystroke
	 * @type {Boolean}
	 */
	CIQ.UI.Keystroke.noKeyCapture=false;

	// http://stackoverflow.com/questions/30743490/capture-keys-typed-on-android-virtual-keyboard-using-javascript
	// On Chrome Android, the keydown/keyup events are broken. We have to figure out the key that was pressed by
	// examining the value of an input box before (keydown) and after (keyup) and identifying what changed
	// Note that CIQ.isAndroid is false when the user requests "desktop site" and so some input boxes won't work
	// in that situation. There is no workaround other than to always treat 229 as a false value (it is a swedish character)
	CIQ.UI.Keystroke.prototype.androidWorkaroundKeyup=function(e){
		var newValue=e.target.value;
		var key;
		if(newValue.length>this.downValue.length){
			key=newValue.charCodeAt(newValue.length-1);
		}else{
			key="delete";
		}
		this.cb({key:key,e:e,keystroke:this});
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
	CIQ.UI.Keystroke.prototype.keyup=function(e){
		var key = e.which;
		if(this.implementAndroidWorkaround){
			this.androidWorkaroundKeyup(e);
			this.implementAndroidWorkaround=false;
			return;
		}

		switch(key){
			case 16:
				this.shift=false;
				this.cb({key:key,e:e,keystroke:this});
				return;
			case 17:
			case 18:
				this.ctrl=false;
				this.cb({key:key,e:e,keystroke:this});
				return;
			case 91:
				this.cmd=false;
				this.cb({key:key,e:e,keystroke:this});
				return;
			default:
				break;
		}
		// This is where we handle the keystroke, regardless of whether we captured the key with a down or press event
		// The exception to this is the arrow keys, which are processed in keydown
		if(this.key) this.cb({key:this.key,e:e,keystroke:this});
	};

	CIQ.UI.Keystroke.prototype.keydown=function(e){
		if(this.noKeyCapture) return;
		var key = e.which;
		if(key==229 && CIQ.isAndroid){
			this.implementAndroidWorkaround=true;
			return;
		}
		if(!this.ctrl)
			if((key != 91 && key>=48 && key<=222)||key==32) return; // handled by keypress

		switch(key){
			case 91:
				this.cmd=true;
				return;
			case 16:
				this.shift=true;
				return;
			case 17:
			case 18:
				this.ctrl=true;
				return;
			case 20:
				this.capsLock=!this.capsLock;
				return;
		}
		if(key==8) key="backspace"; // delete on mac
		if(key==9) key="tab";
		if(key==13) key="enter";
		if(key==27) key="escape";
		if(key==33) key="page up";
		if(key==34) key="page down";
		if(key==35) key="end";
		if(key==36) key="home";
		if(key==45) key="insert";
		if(key==46) key="delete";
		this.key=key;

		// If you hold a key down, then keydown will repeat. These are the keys
		// that we want to capture repeat action.
		if(key==37 || key==38 || key==39 || key==40){
			if(key==37) key="left";
			if(key==38) key="up";
			if(key==39) key="right";
			if(key==40) key="down";
			this.key=null;
			this.cb({key:key,e:e,keystroke:this});
			return;
		}
	};

	/**
	 * Identifies a keypress event
	 * @memberof CIQ.UI.Keystroke
	 * @param e
	 */
	CIQ.UI.Keystroke.prototype.keypress=function(e){
		if(this.noKeyCapture) return;
		var key = e.which;
		if(key<32 || key>222) return; // handled by keydown
		this.key=key;
	};

	/**
	 * initializes member funcitons
	 * @memberof CIQ.UI.Keystroke
	 */
	CIQ.UI.Keystroke.prototype.initialize=function(){
		var self=this;
		$(document).on("keyup", this.node, function(e){
			self.keyup(e);
		});
		$(document).on("keydown", this.node, function(e){
			self.downValue=e.target.value;
			self.keydown(e);
		});
		$(document).on("keypress", this.node, function(e){
			self.keypress(e);
		});
		$(window).on("blur", function(e){ // otherwise ctrl-t to switch tabs causes ctrl to get stuck
			self.ctrl=false;
			self.cb({key:17,e:e,keystroke:self});
		});
	};


	/**
	 * UI Helper for capturing and handling keystrokes. A helper or ContextTag can
	 * "claim" keystrokes and intercept them, otherwise the keystrokes will be handled
	 * by keyup and keydown.
	 *
	 * @param {HTMLElement} [node] The node to which to attach, generally the chart container
	 * @param {CIQ.UI.Context} context The context for the chart
	 * @param {Object} [params] Parameters to drive the helper
	 * @param {Function} [params.cb] Callback to handle hot keys.
	 * @name CIQ.UI.KeyboardShortcuts
	 * @constructor
	 */
	CIQ.UI.KeystrokeHub=function(node, context, params){
		this.node=$(node);
		this.context=context;
		this.params=params?params:{};
		this.uiManager=$("cq-ui-manager");
		if(this.uiManager.length>0) this.uiManager=this.uiManager[0];

		var self=this;
		function handler(){
			return function(){
				self.handler.apply(self, arguments);
			};
		}
		this.keystroke=new CIQ.UI.Keystroke(node, handler());
	};

	CIQ.UI.KeystrokeHub.ciqInheritsFrom(CIQ.UI.Helper);

	/**
	 * Global default hotkey method. Pass this or your own metho in to CIQ.UI.KeystrokeHub
	 * @memberof CIQ.UI.KeyboardShortcuts
	 * @param  {number} key The pressed key
	 * @param  {CIQ.UI.KeystrokeHub} hub The hub that processed the key
	 * @return {boolean}     Return true if you captured the key
	 */
	CIQ.UI.KeystrokeHub.defaultHotKeys=function(key, hub){
		var stx=hub.context.stx;
		var push=1;
		switch(key){
			case "up":
				stx.zoomIn();
				break;
			case "down":
				stx.zoomOut();
				break;
			case "home":
				stx.home();
				stx.headsUpHR();
				break;
			case "end":
				stx.chart.scroll=stx.chart.dataSet.length;
				stx.draw();
				stx.headsUpHR();
				break;
			case "left":
				if(stx.ctrl){
					stx.zoomOut();
				}else{
					push=1;
					if(stx.shift || hub.capsLock) push=Math.max(5,5*(8-Math.round(stx.layout.candleWidth)));
					if(stx.chart.scroll+push>=stx.chart.dataSet.length)
						push=stx.chart.dataSet.length-stx.chart.scroll;
					stx.chart.scroll+=push;
					stx.draw();
					stx.headsUpHR();
				}
				break;
			case "right":
				if(stx.ctrl){
					stx.zoomIn();
				}else{
					push=1;
					if(stx.shift || hub.capsLock) push=Math.max(5,5*(8-Math.round(stx.layout.candleWidth)));
					stx.chart.scroll-=push;
					stx.draw();
					stx.headsUpHR();
				}
				break;
			case "delete":
			case "backspace":
				if(CIQ.ChartEngine.drawingLine){
					stx.undo();
				}else if(stx.anyHighlighted){
					stx.deleteHighlighted();
				}else{
					return false;
				}
				break;
			case "escape":
				if(CIQ.ChartEngine.drawingLine){
					stx.undo();
				}else{
					if(hub.uiManager) hub.uiManager.closeMenu();
				}
				break;
			default:
				return false; // not captured
		}
		return true;
	};

	CIQ.UI.KeystrokeHub.prototype.handler=function(obj){
		var stx=this.context.stx;
		if(stx.editingAnnotation) return;
		var e=obj.e, key=obj.key, keystroke=obj.keystroke, targetTagName=obj.e.target.tagName;
		switch(key){
			case 16:
				stx.shift=keystroke.shift;
				break;
			case 17:
			case 18:
				stx.ctrl=keystroke.ctrl;
				break;
			case 91:
				stx.cmd=keystroke.cmd;
				break;
			case 20:
				this.capsLock=!this.capsLock;
				break;
			default:
				break;
		}
		if(!CIQ.ChartEngine.drawingLine){
			if(this.context.processKeyStrokeClaims(this, key, e, keystroke)) return;
		}

		if(key!="escape"){
			if(this.context.isModal()) return;
		}

		if(targetTagName=="INPUT" || targetTagName=="TEXTAREA") return; // target is not the chart

		if(this.params.cb){
			if(this.params.cb(key, this)) e.preventDefault();
		}
	};

	/**
	 * Global web component that manages the overall UI. This component keeps track of open menus and dialogs.
	 * It attaches events to the body in order to close them.
	 * @namespace WebComponents.cq-ui-manager
	 * @memberof WebComponents
	 */
	var UIManager = {
		prototype: Object.create(HTMLElement.prototype)
	};

	/**
	 * Prevents underlay clicks and handles tap events and callbacks.
	 *
	 * Creates an array of the active Menus to keep track of which component is currently active.
	 * @memberof WebComponents.cq-ui-manager
	 * @alias createdCallback
	 */
	UIManager.prototype.createdCallback=function(){
		CIQ.installTapEvent($("body")[0], {preventUnderlayClick:false});
		this.activeMenuStack=[];
		this.registeredForResize=[];

		var self=this;
		function handleTap(){
			self.closeTopMenu();
		}
		$("body").on("stxtap", handleTap);
	};

	/**
	 * Attach a callback to an individual component as part of the context
	 * @memberof WebComponents.cq-ui-manager
	 * @alias attachedCallback
	 */
	UIManager.prototype.attachedCallback=function(){
		var self=this;
		this.resize=function(){
			var rr=self.registeredForResize;
			for(var i=0;i<rr.length;i++){
				if(typeof rr[i].resize=="function") rr[i].resize();
			}
		};
		window.addEventListener('resize', this.resize);
	};

	/**
	 * Removes a callback from a component
	 * @memberof WebComponents.cq-ui-manager
	 * @alias detachedCallback
	 */
	UIManager.prototype.detachedCallback=function(){
		window.removeEventListener('resize', this.resize);
	};

	/**
	 * Opens a menu item within the UI.Context
	 * @memberof WebComponents.cq-ui-manager
	 * @alias openMenu
	 * @param {HTMLElement} menu
	 * @param {object} params
	 */
	UIManager.prototype.openMenu=function(menu, params){
		// Find the first input box, if any, and give focus
		setTimeout(function(){
			$(menu).find('input[cq-focus]:first-child').focus();
		},0);
		this.activeMenuStack.push(menu);
		menu.show(params);
		$("*[cq-context]").each(function(){
			this.CIQ.UI.context.stx.modalBegin();
		});
	};

	/**
	 * Sets the top level menu in the activeMenuStack
	 * @memberof WebComponents.cq-ui-manager
	 * @alias topMenu
	 * @return activeMenuStack
	 */
	UIManager.prototype.topMenu=function(){
		var activeMenuStack=this.activeMenuStack;
		if(!activeMenuStack.length) return null;
		return activeMenuStack[activeMenuStack.length-1];
	};

	/**
	 * Closes the current acttive menu and resets the activeMenuStack
	 * @memberof WebComponents.cq-ui-manager
	 * @alias closeMenu
 	 * @param {HTMLElement} element
	 */
	UIManager.prototype.closeMenu=function(menu){
		var activeMenuStack=this.activeMenuStack;
		var parents=$(menu).parents("cq-menu");
		var closeThese=[];
		if(menu){
			// if menu is specified then close it
			closeThese.push(menu);
			// along with any active parent menus
			for(var i=0;i<parents.length;i++){
				var parent=parents[i];
				if(parent.active) closeThese.push(parent);
			}
		}else{
			// close them all if no menu is specified
			closeThese=activeMenuStack;
		}
		// hide all the items we've decided to close
		for(var j=0;j<closeThese.length;j++){
			closeThese[j].hide();
		}
		// filter out the ones that are inactive
		this.activeMenuStack=activeMenuStack.filter(function(item){
			return item.active;
		});
		this.ifAllClosed();
	};

	/**
	 *
	 * @memberof WebComponents.cq-ui-manager
	 * @alias registerForResize
 	 * @param {HTMLElement} element
	 */
	UIManager.prototype.registerForResize=function(element){
		this.registeredForResize.push(element);
	};

	/**
	 * @memberof WebComponents.cq-ui-manager
	 * @alias unregisterForResize
	 * @param {HTMLElement} element
	 */
	UIManager.prototype.unregisterForResize=function(element){
		var rr=this.registeredForResize;
		for(var i=0;i<rr.length;i++){
			if(rr[i]===element){
				rr.splice(i,1);
				return;
			}
		}
	};

	/**
	 * @memberof WebComponents.cq-ui-manager
	 * @alias ifAllClosed
	 */
	UIManager.prototype.ifAllClosed=function(){
		if(!this.activeMenuStack.length){
			$("*[cq-context]").each(function(){
				this.CIQ.UI.context.stx.modalEnd();
			});
		}
	};

	/**
	 * @memberof WebComponents.cq-ui-manager
	 * @alias closeTopMenu
	 */
	UIManager.prototype.closeTopMenu=function(){
		var activeMenuStack=this.activeMenuStack;
		if(!activeMenuStack.length) return;
		var menu=activeMenuStack[activeMenuStack.length-1];
		// If the top menu is a dialog, and isn't active yet then it has just been added, don't remove it
		if(!menu.isDialog || menu.active){
			activeMenuStack.pop();
			menu.hide();
			this.ifAllClosed();
		}
	};


	/**
	 * Find all lifts for the menu, but not lifts that are within nested menus.
	 * @memberof WebComponets.cq-ui-manager
	 * @alias findLifts
	 * @param  {HTMLElement} menu The menu to search
	 * @return {JQuery}      Jquery selector containing any lifts
	 */
	UIManager.prototype.findLifts=function(menu){
		var lifts=$(menu).find("*[cq-lift]").filter(function(){
			// only valid if the closest cq-menu or cq-dialog parent is the menu itself
			// otherwise the lift is in a nested menu
			var closest=$(this).closest("cq-menu,cq-dialog");
			return closest.length && closest[0]==menu;
		});
		return lifts;
	};

	/**
	 *
	 * @memberof WebComponents.cq-ui-manager
	 * @alias restoreLift
	 * @param {HTMLElement} element
	 */
	UIManager.prototype.restoreLift=function(element){
		var node=$(element);
		if(!node.length) return;
		var remember=node[0].remember;
		node.detach();
		node.css(remember.css);
		$(remember.parentNode).append(node);
	};

	/**
	 * Lifts a menu to an absolute position on the body, so that it can rise above any
	 * overflow: hidden, scroll or iscroll situations
	 *
	 * Use cq-lift attribute to indicate that the menu should be lifted when opened
	 *
	 * context.lifts is an array that contains all of the current lifts so that
	 * they can be restored when the menu is closed
	 * @private
	 * @memberof WebComponents.cq-ui-manager
	 */
	UIManager.prototype.lift=function(element){
		var node=$(element);
		if(!node.length) return;
		var n=$(node)[0];
		n.remember={
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
		var offset=node.offset();
		var height=node.height();
		node.detach();
		node.css({
			"position": "absolute",
			"display": "block",
			"left": offset.left + "px",
			"top": offset.top + "px",
			"height": height + "px",
			"opacity": 1
		});
		$("body").append(node);
		if(typeof(n.resize)!="undefined") n.resize();
		node.find("cq-scroll").each(function(){
			this.resize();
		});
	};

	CIQ.UI.UIManager=document.registerElement("cq-ui-manager", UIManager);

	return _exports;
});
