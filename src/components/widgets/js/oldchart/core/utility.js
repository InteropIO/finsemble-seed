// -------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
// Be sure your webserver is set to deliver UTF-8 charset
// For apache add "AddDefaultCharset UTF-8" to httpd.conf
// otherwise use \u unicode escapes for non-ascii characters
(function (definition) {
    "use strict";

    if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition(require('./polyfills'));
    } else if (typeof define === "function" && define.amd) {
        define(['core/polyfills'], definition);
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
    } else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for utility.js.");
    }

})(function(_exports) {
	console.log("utility.js",_exports);
	// Node.js compatibility
	if(typeof global!=="undefined"){
		if(typeof global.CanvasRenderingContext2D==="undefined") global.CanvasRenderingContext2D=function(){};
	}

	/* TOC()************* IQQUERY ************** */

	/**
	 * Shorthand for getElementById(). Equivalent to prototype style $() which is faster but less powerful than jquery style $()
	 * @param  {string} id     An ID tag for a valid DOM object
	 * @param  {object} [source] - An optional valid DOM node to search within. If not provided then the entire document will be searched.
	 * @return {object}        The DOM node associated with the id or null if it is not found
	 * @name  $$
	 */
	function $$(id, source){
		if(!source) return document.getElementById(id);
		if(source.id==id) return source;	// Found it!
		if(!source.hasChildNodes) return null;
		for(var i=0;i<source.childNodes.length; i++){
			var element=$$(id, source.childNodes[i]);
			if(element) return element;
		}
		return null;
	}
	_exports.$$=$$;

	/**
	 * Functional equivalent of querySelector(). Functionally equivalent to jquery $().
	 * This uses querySelectorAll in order to maintain compatibility with IE 9.
	 * Note that if multiple objects match the selector then only the first will be returned.
	 * @param  {string} selector - CSS style selector
	 * @param  {object} [source]   Optional node to select within. If not provided then entire document will be searched.
	 * @return {object}          The first object to match the selector
	 * @name  $$$
	 */
	function $$$(selector, source){
		if(!source) source=document;
		return source.querySelectorAll(selector)[0];	// We use querySelectorAll for backward compatibility with IE
	}
	_exports.$$$=$$$;


	/* TOC()************* PROTOTYPE EXTENSION ************** */

	/**
	 * Capitalizes the first letter of a string
	 * @return {string} Capitalized version of the string
	 */
	String.prototype.capitalize = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	};
	
	
	if(!Function.prototype.ciqInheritsFrom){
		/**
		 * Template for JavaScript inheritence.
		 * @param  {object} parentClassOrObject The parent class or object
		 * @param {Boolean} [autosuper=true] Set to false to prevent the base class constructor from being called automatically
		 */
		Function.prototype.ciqInheritsFrom = function (parentClassOrObject, autosuper){
			if(autosuper!==false){
				this.prototype=new parentClassOrObject();
			}else{
				this.prototype=Object.create(parentClassOrObject);
				for (var key in parentClassOrObject.prototype)  {
					this.prototype[key] = parentClassOrObject.prototype[key];
				}
			}
			this.prototype.constructor = this;
			this.prototype.parent = parentClassOrObject.prototype;
		};
		Function.prototype.stxInheritsFrom=Function.prototype.ciqInheritsFrom; // backward compatiblity
	}

	
	/**
	 * The built-in 2D rendering context for the drawing surface of a {@link external:canvas}.
	 * @external CanvasRenderingContext2D
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D CanvasRenderingContext2D at the Mozilla Developer Network}
	 */

	/**
	 * Dashed line polyfill for the canvas. Note that dashed lines are expensive operations when not supported natively! @see CanvasRenderingContext2D.stxLine
	 * @memberOf external:CanvasRenderingContext2D
	 */
	CanvasRenderingContext2D.prototype.dashedLineTo = function (fromX, fromY, toX, toY, pattern) {
		  // Our growth rate for our line can be one of the following:
		  // (+,+), (+,-), (-,+), (-,-)
		  // Because of this, our algorithm needs to understand if the x-coord and
		  // y-coord should be getting smaller or larger and properly cap the
			// values
		  // based on (x,y).
		  var lt = function (a, b) { return a-b <= 0.00000001; };
		  var gt = function (a, b) { return a-b >= -0.00000001; };
		  var capmin = function (a, b) { return Math.min(a, b); };
		  var capmax = function (a, b) { return Math.max(a, b); };

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
		  if(isNaN(fromX) || isNaN(fromY)) return;
		  var offsetX = fromX;
		  var offsetY = fromY;
		  var idx = 0, dash = true;
		  while (!(checkX.thereYet(offsetX, toX) && checkY.thereYet(offsetY, toY))) {
		    var ang = Math.atan2(toY - fromY, toX - fromX);
		    var len = pattern[idx];

		    offsetX = checkX.cap(toX, offsetX + (Math.cos(ang) * len));
		    offsetY = checkY.cap(toY, offsetY + (Math.sin(ang) * len));

		    if (dash) this.lineTo(offsetX, offsetY);
		    else this.moveTo(offsetX, offsetY);

		    idx = (idx + 1) % pattern.length;
		    dash = !dash;
		  }
		};

	/**
	 * Convenience function for rendering lines of various types on the canvas. Pattern should be an array that contains
	 * the number of pixels on and then the number of pixels off. For instance [1,1] would create a dotted pattern by turning
	 * one pixel on and then one pixel off repeatedly.
	 * @memberOf external:CanvasRenderingContext2D
	 */
	CanvasRenderingContext2D.prototype.stxLine = function (fromX, fromY, toX, toY, color, opacity, lineWidth, pattern) {
		this.beginPath();
		this.lineWidth=lineWidth;
		this.strokeStyle=color;
		this.globalAlpha=opacity;
		if(pattern){
			this.dashedLineTo(fromX, fromY, toX, toY, pattern);
		}else{
			this.moveTo(fromX, fromY);
			this.lineTo(toX, toY);
		}
		this.stroke();
		this.closePath();
		this.lineWidth=1;
	};

	/**
	 * Add native circle drawing to the canvas
	 * @param  {number} x      X position of center of circle
	 * @param  {number} y      Y position of center of circle
	 * @param  {number} radius Radius of circle
	 * @param  {boolean} filled If true then circle will be filled
	 * @memberOf external:CanvasRenderingContext2D
	 */
	CanvasRenderingContext2D.prototype.stxCircle = function(x, y,radius, filled){
		this.beginPath();
		this.arc(x, y, radius, 0, 2* Math.PI, false);
		if(filled) this.fill();
		this.stroke();
		this.closePath();
	};

	
	/* TOC()************* CIQ ************** */
	/**
	 * Base namespace for CIQ library
	 * @name CIQ
	 * @namespace
	 */
	function CIQ(){}
	_exports.CIQ=CIQ;
	_exports.STX=CIQ; // backward compatibility

	/* TOC()************* PLATFORM DETECTION ************** */

	var nav=typeof(navigator)!=="undefined"?navigator:{userAgent:""};
	var userAgent=nav.userAgent;
	var win=typeof(window)!=="undefined"?window:{};
	var doc=typeof(document)!=="undefined"?document:{};
	CIQ.ipad = userAgent.indexOf("iPad") != -1;
	CIQ.iphone = userAgent.indexOf("iPhone") != -1;
	CIQ.isSurface = nav.msMaxTouchPoints && nav.msMaxTouchPoints > 1;
	CIQ.touchDevice = typeof(doc.ontouchstart)!="undefined" || CIQ.isSurface;
	CIQ.is_chrome = userAgent.toLowerCase().indexOf('chrome') > -1;
	CIQ.isAndroid = userAgent.toLowerCase().indexOf("android") > -1;
	CIQ.isIE = (userAgent.toLowerCase().indexOf("msie")>-1) || (userAgent.indexOf("Trident") > -1);
	CIQ.isIE9 = (userAgent.indexOf("Trident/5") > -1) || (userAgent.indexOf("MSIE 9.0")>-1);
	CIQ.isIE8 = win.isIE8 || userAgent.indexOf("MSIE 8.0")>-1;
	CIQ.isIOS7 = userAgent.match(/(iPad|iPhone);.*CPU.*OS 7_\d/i);
	CIQ.isIOS8 = userAgent.match(/(iPad|iPhone);.*CPU.*OS 8_\d/i);
	CIQ.isIOS9 = userAgent.match(/(iPad|iPhone);.*CPU.*OS 9_\d/i);
	CIQ.isIOS10 = userAgent.match(/(iPad|iPhone);.*CPU.*OS 10_\d/i);
	CIQ.isIOS7or8 = CIQ.isIOS7 || CIQ.isIOS8 || CIQ.isIOS9 || CIQ.isIOS10;
	CIQ.isSurfaceApp = win.MSApp;
	CIQ.noKeyboard = CIQ.ipad || CIQ.iphone || CIQ.isAndroid || CIQ.isSurfaceApp;


	/* TOC()************* MATH ************** */

	/**
	 * Returns the log base 10 of a value
	 * @param  {number} y The value
	 * @return {number}   log10 value
	 * @memberOf  CIQ
	 */
	CIQ.log10=function(y){
		return Math.log(y)/Math.LN10;
	};

	/* TOC()************* OBJECT MANIPULATION ************** */

	/**
	 * Deletes the map entries for which the right hand side is the object in question.
	 * @param  {Object} map    JavaScript map object
	 * @param  {Object} object The actual object to be deleted from the map
	 * @return {Boolean}        Returns true if any object actually deleted
	 */
	CIQ.deleteRHS=function(map, object){
		var deletedOne=false;
		for(var i in map){
			if(map[i]==object){
				delete map[i];
				deletedOne=true;
			}
		}
		return deletedOne;
	};

	/**
	 * Deletes (removes) nulls or undefined fields (names) from an object. This is useful when marshalling (saving) an object where you don't wish
	 * null or undefined values to show up in the marshalled object (such as when converting to JSON)
	 * @param  {object} obj         The object to scrub
	 * @param  {boolean} [removeNulls] Whether or not to remove null values
	 * @memberOf  CIQ
	 */
	CIQ.scrub=function(obj, removeNulls){
		for(var i in obj){
			if(typeof(obj[i])=="undefined")
				delete obj[i];
			if(removeNulls && obj[i]===null)
				delete obj[i];
		}
	};

	/**
	 * This is method changes the target object's contents to match the contents of the source object. This is functionality equivalent
	 * to `target=source` except that it preserves the existence of the target object. This is vitally important if there are data bindings
	 * to the target object otherwise those databindings would remain attached to a phantom object! The logic here is orchestrated so that you
	 * will receive update, add and delete notifications for each field that changes.
	 * @param  {Object} target The target object
	 * @param  {Object} source The source object
	 * @since 2015-11-1
	 */
	CIQ.dataBindSafeAssignment=function(target, source){
		for(var prop in source) {
			target[prop]=source[prop];
		}
		for(prop in target) {
			if (typeof(source[prop])=="undefined") {
				delete target[prop];
			}
		}
	};

	/**
	 * Clones an object. This function creates a deep (recursive) clone of an object. The object can be a primitive or an object or an array.
	 * Note that cloning objects that reference DOM nodes can result in stack overflows. Use with caution.
	 * @param  {object} from The source object
	 * @param  {object} [to]   Optional existing object of same type. Can improve performance when objects are reusable.
	 * @return {object}      A deep clone of the "from" object
	 * @memberOf  CIQ
	 */
	CIQ.clone=function(from, to)
	{
	    if (from === null || typeof from != "object") return from;
	    // if (from.constructor != Object && from.constructor != Array) return from;
	    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
	        from.constructor == String || from.constructor == Number || from.constructor == Boolean)
	        return new from.constructor(from);

	    to = to || new from.constructor();

	    for (var n in from)
	    {
	        to[n] = typeof to[n] == "undefined" ? CIQ.clone(from[n], null) : to[n];
	    }

	    return to;
	};

	/**
	 * Non recursive clone. This will only clone the top layer and is safe to use when objects contain DOM nodes.
	 * @param  {object} from - Object to be cloned
	 * @return {object}      A shallow clone of the "from" object
	 * @memberOf  CIQ
	 */
	CIQ.shallowClone=function(from){
		if(!from) return from;
		var to;
		if(from.constructor==Array){
			to=new Array(from.length);
			for(var i=0;i<from.length;i++){
				to[i]=from[i];
			}
			return to;
		}else{
			to={};
			for(var field in from){
				to[field]=from[field];
			}
			return to;
		}
	};


	/**
	 * Extends an object, similar to jquery.extend() with a deep copy
	 * @param {Object} target Target object
	 * @param  {Object} source Original object
	 * @param {Boolean} [shallow] If true then extend will not recurse through objects
	 * @return {Object} Target object after extension
	 */
	CIQ.extend=function(target, source, shallow){
		for(var field in source){
			var datum=source[field];
			if(!datum) target[field]=datum;
			else if(datum.constructor==Object){
				if(!target[field]) target[field]={};
				if(shallow){
					target[field]=source[field];
				}else{
					CIQ.extend(target[field], source[field]);
				}
			}else if(datum.constructor==Array){
				target[field]=datum.slice();
			}else{
				target[field]=datum;
			}
		}
		return target;
	};
	
	/**
	 * Returns true if the objects are an exact match
	 * @param  {Object} a First object
	 * @param  {Object} b Second object
	 * @param  {Object} [exclude] Exclude these fields
	 * @return {Boolean}   True if they are an exact match
	 */
	CIQ.equals = function(a, b, exclude){
		if(!a && b) return false;
		if(a && !b) return false;
		if(typeof(a) !== typeof(b)) return false;
		for(var field in a){
			if(exclude && exclude[field]) continue;
			if(typeof(a[field])==="object"){
				var result=CIQ.equals(a[field], b[field]);
				if(!result) return false;
				continue;
			}
			if(b[field]!=a[field]) return false;
		}
		return true;
	};


	/**
	 * Returns true if an object has no members
	 * @param  {object}  o A JavaScript object
	 * @return {Boolean}   True if there are no members in the object
	 * @memberOf  CIQ
	 */
	CIQ.isEmpty = function( o ) {
	    for ( var p in o ) {
	        if ( o.hasOwnProperty( p ) ) { return false; }
	    }
	    return true;
	};

	/**
	 * Convenience function returns the first property in an object. Note that while this works in all known browsers
	 * the EMCA spec does not guarantee that the order of members in an object remain static. This method should therefore
	 * be avoided. When ordering is important use an Array!
	 * @param  {object} o A JavaSCript object
	 * @return {object}   The first element in the object or null if it is empty
	 * @memberOf  CIQ
	 */
	CIQ.first = function( o ) {
	    for ( var p in o ) {
	        return p;
	    }
	    return null;
	};

	/**
	 * Convenience function for returning the last property in an object. Note that while this works in all known browsers
	 * the EMCA spec does not guarantee that the order of members in an object remain static. This method should therefore
	 * be avoiding. When ordering is important use an Array!
	 * @param  {object} o A JavaScript object
	 * @return {object}   The final member of the object or null if the object is empty
	 * @memberOf  CIQ
	*/
	CIQ.last = function( o ) {
		var l=null;
	    for ( var p in o ) {
	        l=p;
	    }
	    return l;
	};

	/**
	 * Returns the number of members in an object
	 * @param  {object} o A valid JavaScript object
	 * @return {number}   The number of members in the object
	 * @memberOf  CIQ
	 */
	CIQ.objLength = function( o ) {
		var i=0;
	    for ( var p in o ) {
	        i++;
	    }
	    return i;
	};

	/**
	 * Given a dot notation string, we want to navigate to the location
	 * in a base object, creating the path along the way
	 * @param  {Object} base      Base object.
	 * @param  {String} extension String in dot notation
	 * @return {Object}           A tuple containing obj and member
	 * @memberOf  CIQ
	 * @since  2015-11-1
	 * @example
	 * var tuple=CIQ.deriveFromObjectChain(stx.layout, "pandf.box");
	 * tuple.obj===stx.layout.pandf
	 * tuble.member==="box"
	 * tuple.obj[tuple.member]="square";  // stx.layout.pandf.box="square"
	 */
	CIQ.deriveFromObjectChain=function(base, extension){
		var objectString=extension.split(".");
		if(objectString.length===1)
			return {obj:base,member:extension};
		for(var i=0;i<objectString.length-1;i++){
			if(!base[objectString[i]]) base[objectString[i]]={};
			base=base[objectString[i]];
		}
		return {obj:base, member: objectString[i]};
	};

	/**
	 * Replacement for isPrototypeOf and instanceof so that both types of inheritance can be checked
	 * @param  {Object} parent Prototype
	 * @return {boolean} True if the object is derived from the parent
	 * @memberOf  CIQ
	 * @since 07/01/2015
	 */
	CIQ.derivedFrom = function(child, parent){
		if(parent.isPrototypeOf(child)) return true;
		if(child instanceof parent) return true;
		return false;
	};
	
	/**
	 * This method will iterate through the object and replace all of the fields
	 * using the mapping object. This would generally be used to compress an object
	 * for serialization. so that for instance "lineWidth" becomes "lw". This method
	 * is called recursively.
	 * @param {object} obj Object to compress
	 * @param {object} mapping Object containing name value pairs. Each name will be replaced with its corresponding value in the object.
	 * @return {object} The newly compressed object
	 * @memberOf  CIQ
	 */
	CIQ.replaceFields=function(obj, mapping){
		if(!obj) return obj;
		var newObj={};
		for(var field in obj){
			var value=obj[field];
			var replaced=mapping[field];
			if(!replaced) replaced=field;
			if(value && typeof value=="object"){
				if(value.constructor==Array){
					var arr=newObj[replaced]=new Array(value.length);
					for(var i=0;i<arr.length;i++){
						var val=value[i];
						if(typeof val=="object"){
							arr[i]=CIQ.replaceFields(val, mapping);
						}else{
							arr[i]=val;
						}
					}
				}else{
					newObj[replaced]=CIQ.replaceFields(value, mapping);
				}
			}else{
				newObj[replaced]=value;
			}
		}
		return newObj;
	};

	/**
	 * Returns an object copy with any null values removed
	 * @param  {object} obj Object to remove nulls
	 * @return {object}     Object with nulls removed
	 */
	CIQ.removeNullValues=function(obj){
		var n=CIQ.clone(obj);
		for(var f in n){
			if(!n[f]) delete n[f];
		}
		return n;
	};

	/**
	 * This method reverses the fields and values in an object
	 * @memberOf  CIQ
	 */
	CIQ.reverseObject=function(obj){
		var newObj={};
		for(var field in obj){
			newObj[obj[field]]=field;
		}
		return newObj;
	};


	/* TOC()************* CLASSNAME MANIPULATION ************** */

	CIQ.camelCaseRegExp=/-([a-z])/g;
	/**
	 * Converts from hyphenated to camel case. Used primarily for converting css style names (which are hyphenated) to property values (which are camel case)
	 * @param  {string} name Hyphenated style name
	 * @return {string}		 Camel case style name
	 * @memberOf CIQ
	 */
	CIQ.makeCamelCase=function(name){
		return name.replace(CIQ.camelCaseRegExp, function (g) { return g[1].toUpperCase(); });
	};
	
	/**
	 * Appends a class name to a node if it isn't already there. This is frequently used to control dynamic behavior via CSS.
	 * @example
	 * // Apply an "active" css look to an object
	 * CIQ.appendClassName(myNode, "active");
	 * @param  {object} node      A valid DOM element
	 * @param  {string} className Name of class to add to the DOM element
	 * @memberOf  CIQ
	 */
	CIQ.appendClassName=function(node, className){
		if(node.className==className) return; // already a class
		var s=node.className.split(" ");
		for(var i=0;i<s.length;i++){
			if(s[i]==className) return;	// already a class
		}
		if(!node.className) node.className=className;
		else node.className+=" " + className;
	};

	/**
	 * Removes a class name from a node if it is set
	 * @param  {object} node      A valid DOM element
	 * @param  {string} className The class name to remove
	 * @memberOf  CIQ
	 */
	CIQ.unappendClassName=function(node, className){
		if(!node) return;
		if(node.className.indexOf(className)==-1) return;
		if(node.className==className){
			node.className="";
		}else{
			var s=node.className.split(" ");
			var newClassName="";
			for(var i=0;i<s.length;i++){
				if(s[i]==className) continue;
				if(newClassName!=="") newClassName+=" ";
				newClassName+=s[i];
			}
			node.className=newClassName;
		}
	};

	/**
	 * Convenience method for swapping two class names within a node. Such as for changing state.
	 * @param  {object} node         A valid DOM element
	 * @param  {string} newClassName The class name to swap in
	 * @param  {string} oldClassName The class name to swap out
	 * @memberOf  CIQ
	 */
	CIQ.swapClassName=function(node, newClassName, oldClassName){
		CIQ.unappendClassName(node, oldClassName);
		CIQ.appendClassName(node, newClassName);
	};

	/**
	 * Returns true if a class name is currently assigned to the DOM node
	 * @param  {object}  node      A valid DOM element
	 * @param  {string}  className The class name to search for
	 * @return {Boolean}           True if the class name is currently assigned to the DOM node
	 * @memberOf  CIQ
	 */
	CIQ.hasClassName=function(node, className){
		if((" "+node.className+" ").indexOf(" "+className+" ")>-1) return true;
		else return false;
	};

	/**
	 * Toggles the className on or off
	 * @param  {HtmlElement} node      The node to toggle
	 * @param  {String} className The class name to toggle
	 */
	CIQ.toggleClassName=function(node, className){
		if(CIQ.hasClassName(node, className))
			CIQ.unappendClassName(node, className);
		else
			CIQ.appendClassName(node, className);
	};

	
	
	/* TOC()************* DOM MANIPULATION ************** */

	/**
	 * Convenience function for dynamically creating a new node and appending it into the DOM.
	 * @param  {object} div       The targeted parent node
	 * @param  {string} tagName   The type of node to be created
	 * @param  {string} [className] Optional class name to set the new node
	 * @param {string} [txt] Optional text to insert
	 * @return {object}           The new node
	 * @memberOf  CIQ
	 */
	CIQ.newChild=function(div, tagName, className, txt){
		var div2=document.createElement(tagName);
		if(className) div2.className=className;
		div.appendChild(div2);
		if(txt) div2.innerHTML=txt;
		return div2;
	};
	
	/**
	 * Microsoft RT disallows innerHTML that contains DOM elements. Use this method to override when necessary.
	 * @param  {object} node A valid DOM element to change innerHTML
	 * @param  {string} html The html text to change
	 * @example
	 * CIQ.innerHTML(node, "My innerHTML contains <span>a span</span> and MS RT doesn't like that");
	 * @memberOf  CIQ
	 */
	CIQ.innerHTML=function(node, html){
		if(window.MSApp){
			MSApp.execUnsafeLocalFunction(function (){
				node.innerHTML=html;
			});
		}else{
			node.innerHTML=html;
		}
	};
	
	/**
	 * Microsoft surface bug requires a timeout in oreder for the cursor to show up in a focused
	 * text box. iPad also, sometimes, when embedded in an iframe, so set useTimeout if in an iframe!
	 * @param  {object} node       A DOM element to focus
	 * @param  {number} useTimeout Whether to apply a timeout or not. If number then the number of milliseconds.
	 * @memberOf  CIQ
	 */
	CIQ.focus = function (node, useTimeout){
		if(CIQ.isSurface || useTimeout){
			var timeout=0;
			if(!isNaN(parseInt(useTimeout,10))) timeout=useTimeout;
			setTimeout(function(){node.focus();}, timeout);
		}else{
			node.focus();
		}
	};

	/**
	 * Reliable, cross-device blur method
	 * @param  {HTMLElement} [node] The element to blur. If not supplied then document.activeElement will be blurred
	 */
	CIQ.blur = function(node){
		if(!node) node=document.activeElement;
		if(node) node.blur();
		window.focus();
	};
	/**
	 * Find all nodes that match the given text. This is a recursive function so be careful not to start too high in the DOM tree.
	 * @param  {object} startNode A valid DOM element from which to start looking
	 * @param  {string} text      The text to search for
	 * @return {array}           An array of nodes that match the text
	 * @memberOf  CIQ
	 */
	CIQ.findNodesByText = function(startNode, text){
		if(startNode.innerHTML==text) return [startNode];
		var nodes=[];
		for(var i=0;i<startNode.childNodes.length;i++){
			var pushNodes=CIQ.findNodesByText(startNode.childNodes[i], text);
			if(pushNodes){
				nodes=nodes.concat(pushNodes);
			}
		}
		if(nodes.length) return nodes;
		return null;
	};

	/**
	 * Hide nodes that match a certain text string.
	 * @param  {object} startNode A valid DOM element from which to start looking
	 * @param  {string} text      The text to match against
	 * {@link  CIQ.findNodesByText}
	 * @memberOf  CIQ
	 */
	CIQ.hideByText = function(startNode, text){
		var nodes=CIQ.findNodesByText(startNode, text);
		for(var i=0;i<nodes.length;i++){
			nodes[i].style.display="none";
		}
	};

	/**
	 * Returns the width of a DOM element including left and right margins.
	 * @param  {HTMLElement} node The DOM element to measure
	 * @return {number}      The width including margins
	 */
	CIQ.outerWidth=function(node){
		var width=node.offsetWidth;
		width+=CIQ.stripPX(getComputedStyle(node).marginLeft);
		width+=CIQ.stripPX(getComputedStyle(node).marginRight);
		return width;
	};
	
	/**
	 * Removes all DOM elements in a given node. This is extremely useful when dynamically generating content.
	 * @param  {object} node - The node to clear
	 * @memberOf  CIQ
	 */
	CIQ.clearNode=function(node){
		if ( node.hasChildNodes() ){
			while ( node.childNodes.length >= 1 ){
	    		node.removeChild( node.firstChild );
			}
		}
	};

	/**
	 * Get the source element for a DOM event depending on browser type
	 * @param  {object} [e] Event if available from browser
	 * @return {object}   The DOM node that registered the event
	 * @memberOf  CIQ
	 */
	CIQ.getEventDOM=function(e){
		if(!e){
			return window.event.srcElement;
		}else{
			return e.target;
		}
	};

	/**
	 * Converts an onClick event to an ontouchend event. If the device is known to be a touch device then this can be used
	 * to change onclick events that are set as attributes (in HTML). ontouchend events are more responsive than onclick events
	 * and can improve the user experience. When coding for cross-device implementations it is recommended to use @see CIQ.safeClickTouch
	 * programatically rather than using hardcoded attributes
	 * @param  {string} id The id of a node containing an onClick attribute
	 * @memberOf  CIQ
	 */
	CIQ.convertClickToTouchEnd=function(id){
		var node=$$(id);
		var s=node.getAttribute("onClick");
		if(s){
			node.removeAttribute("onClick");
			node.setAttribute("onTouchEnd", s);
		}
	};
	
	/**
	 * Returns the height of the page. It is aware of iframes and so will never return a value that is greater
	 * than the value of the parent
	 * @return {number} Height of page in pixels
	 * @memberOf  CIQ
	 */
	CIQ.pageHeight=function() {
		var h=window.innerHeight;
		if(top!=self){
			try{
				if(h>parent.innerHeight) h=parent.innerHeight;
			}catch(e){}
		}
		return h;
	};

	/**
	 * Returns the width of the page. It is aware of iframes and so will never return a value that is greater
	 * than the value of the parent
	 * @return {number} Width of page in pixels
	 * @memberOf  CIQ
	 */
	CIQ.pageWidth=function() {
		var w=window.innerWidth;
		if(top!=self){
			try{
				if(w>parent.innerWidth) w=parent.innerWidth;
			}catch(e){}
		}
		return w;
	};
	
	/**
	 * Strips the letters "px" from a string. This is useful for converting styles into absolutes.
	 * @param  {string} text - String value with "px"
	 * @return {number}      The numeric value
	 * @example
	 * var leftPosition=CIQ.stripPX(node2.style.left)
	 * @memberOf  CIQ
	 */
	CIQ.stripPX=function(text){
		return parseInt(text.substr(0, text.indexOf("p")));
	};

	/* TOC()************* COLOR CONVERSION ************** */
	
	/**
	 * Converts an rgb or rgba color to a hex color
	 * @param  {string} color The rgb or rgba color, such as in CSS format
	 * @return {string}       The hex color. If "transparent" or no color is sent in, #000000 will be assumed
	 * @example
	 * var hexColor=CIQ.colorToHex("rgba (255,255,255,0.3)");
	 * @memberOf  CIQ
	 */
	CIQ.colorToHex=function(color) {
		if(!color || color=="transparent") color="#000000";
		if (color.substr(0, 1) === '#') {
			return color;
		}
		var digits = /(.*?)rgb\((\d+), ?(\d+), ?(\d+)\)/.exec(color);
		if(!digits) digits=/(.*?)rgba\((\d+), ?(\d+), ?(\d+),.*\)/.exec(color);
		// Converts a color name to hex
		function toHex(color) {
			if(typeof document==="undefined") return "#000000";
			var ta=$$("color_converter");
			if(!ta){
				ta=document.createElement("textarea");
				ta.id="color_converter";
				ta.style.display="none";
				document.body.appendChild(ta);
			}
			ta.style.color = "#000000";//reset;
			ta.style.color = color;
			var value;
			if(!CIQ.isIE8){
				value = getComputedStyle(ta).getPropertyValue("color");
				digits = /(.*?)rgb\((\d+), ?(\d+), ?(\d+)\)/.exec(value);
				if(digits) return CIQ.colorToHex(value);
				else if (value.substr(0, 1) === '#') return value;
				else return color;
			}
			value = ta.createTextRange().queryCommandValue("ForeColor");
			value = ((value & 0x0000ff) << 16) | (value & 0x00ff00) | ((value & 0xff0000) >>> 16);
			value = value.toString(16);
			return "#000000".slice(0, 7 - value.length) + value;
		}
		if(!digits) return toHex(color);

		var red = parseFloat(digits[2]);
		var green = parseFloat(digits[3]);
		var blue = parseFloat(digits[4]);

		var rgb = blue | (green << 8) | (red << 16);
		var hexString = rgb.toString(16);
		// fill with leading 0 if not 6 digits.
		for(var i=hexString.length;i<6;i++){
			hexString="0"+hexString;
		}
		var s=digits[1] + '#' + hexString;
	    return s.toUpperCase();
	};

	/**
	 * Converts color to rgba. This does not accept literal color names such as "black"
	 * @param  {string} color The hex rgb or rgba color, such as in CSS format
	 * @param  {number} opacity The 'alpha' value. Defaults to full opacity (100%)
	 * @return {string}       The rgba color
	 * @example
	 * var rgba=CIQ.hexToRgba('rgb(0, 115, 186)');
	 * var rgba=CIQ.hexToRgba('#0073BA');
	 * @memberOf  CIQ
	 */
	CIQ.hexToRgba=function(hex,opacity){
		if(!hex || hex=="transparent") hex="rgba(0,0,0,0)";
		if (hex.substr(0, 4) === 'rgba') {
			var digits=/(.*?)rgba\((\d+), ?(\d+), ?(\d+), ?(\d*\.?\d*)\)/.exec(hex);
			var a=digits[5];
			if(opacity || opacity===0) a=opacity;
			if(a>1) a=a/100;
			return "rgba(" + digits[2] + "," + digits[3] + "," + digits[4] + "," + a + ")";
		} else if (hex.substr(0, 3) === 'rgb') {
			hex=CIQ.colorToHex(hex);
		}
		if(!opacity && opacity!==0) opacity=100; // default to full opacity
		if(opacity<=1) opacity=opacity*100; // handle decimal opacity (css style)

		hex = hex.replace('#','');
		var r = parseInt(hex.slice(0,2), 16);
		var g = parseInt(hex.slice(2,4), 16);
		var b = parseInt(hex.slice(4,6), 16);

		if ( isNaN(r) || isNaN(g) || isNaN(b)) {
			console.log('CIQ.hexToRgba: invalid hex :',hex);
			return null;
		}

		return 'rgba('+r+','+g+','+b+','+opacity/100+')';
	};

	/**
	 * Converts a color to the internal format used by the browser. This allows
	 * interchange of hex, rgb, rgba colors
	 * @param  {String} color A CSS color
	 * @return {String}       The native formatted color
	 */
	CIQ.convertToNativeColor=function(color){
		var a=document.createElement("DIV");
		a.style.color=color;
		a.style.display="none";
		document.body.appendChild(a);
		var c=getComputedStyle(a).color;
		document.body.removeChild(a);
		return c;
	};
	/**
	 * Returns true if the color is transparent. In particular it checks rgba status. Note that the charting engine
	 * often interprets transparent colors to mean that a color should be automatically determined based on the brightness
	 * of the background.
	 * @param  {string}  color The color (from CSS)
	 * @return {Boolean}       True if transparent
	 * @memberOf  CIQ
	 */
	CIQ.isTransparent=function(color){
		if(!color) return false;
		if(color=="transparent") return true;
		var digits=/(.*?)rgba\((\d+), ?(\d+), ?(\d+), ?(\d*\.?\d*)\)/.exec(color);
		if(digits===null) return false;
		if(parseFloat(digits[5])===0) return true;
		return false;
	};

	/**
	 * Converts a color from hex or rgb format to Hue, Saturation, Value. This does not accept literal color names such as "black"
	 * @param  {string} color The color (from CSS)
	 * @return {array}       [Hue, Saturation, Value], or null if invalid color.
	 * @memberOf  CIQ
	 */
	CIQ.hsv=function(color) {
		var hex=CIQ.colorToHex(color);
		if(hex.substr(0,1)==="#") hex=hex.slice(1);
		// fill with leading 0 if not 6 digits.
		for(var i=hex.length;i<6;i++){
			hex="0"+hex;
		}
		var r=parseInt(hex.slice(0,2),16);
		var g=parseInt(hex.slice(2,4),16);
		var b=parseInt(hex.slice(4,6),16);
		var computedH = 0;
		var computedS = 0;
		var computedV = 0;

		//remove spaces from input RGB values, convert to int
		r = parseInt( (''+r).replace(/\s/g,''),10 );
		g = parseInt( (''+g).replace(/\s/g,''),10 );
		b = parseInt( (''+b).replace(/\s/g,''),10 );

		if ( r===null || g===null || b===null || isNaN(r) || isNaN(g)|| isNaN(b) ) {
			console.log('CIQ.hsv: invalid color :',color);
			return null;
		}
		if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
			return null;
		}
		r=r/255; g=g/255; b=b/255;
		var minRGB = Math.min(r,Math.min(g,b));
		var maxRGB = Math.max(r,Math.max(g,b));

		// Black-gray-white
		if (minRGB==maxRGB) {
			computedV = minRGB;
			return [0,0,computedV];
		}

		// Colors other than black-gray-white:
		var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
		var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
		computedH = 60*(h - d/(maxRGB - minRGB));
		computedS = (maxRGB - minRGB)/maxRGB;
		computedV = maxRGB;
		return [computedH,computedS,computedV];
	};

	CIQ.hsl=function(color){
		var hex=CIQ.colorToHex(color);
		if(hex.substr(0,1)==="#") hex=hex.slice(1);
		// fill with leading 0 if not 6 digits.
		for(var i=hex.length;i<6;i++){
			hex="0"+hex;
		}
		var r=parseInt(hex.slice(0,2),16);
		var g=parseInt(hex.slice(2,4),16);
		var b=parseInt(hex.slice(4,6),16);

		r /= 255; g /= 255; b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		}else{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	};

	/**
	 * Chooses either a white or black foreground color depending on the "lightness" of the background color. Note that this simply
	 * checks if the value is above .5 which works well but not ideally for red colors which the human eye interprets differently.
	 * More complex algorithms are available but chartists rarely use red as a background color.
	 * @param  {string} backgroundColor The background color (CSS format)
	 * @return {string}                 Either #000000 (black) or #FFFFFF (white) depending on will look best on the given background color
	 * @memberOf  CIQ
	 */
	CIQ.chooseForegroundColor=function(backgroundColor){
		var hsl=CIQ.hsl(backgroundColor);
		var l=hsl[2];
		if(l && l>0.5) return "#000000";
		else return "#FFFFFF";
	};

	/**
	 * Gets the background color of an element by traversing up the parent stack.
	 * @param  {HTMLElement} el The element to examine
	 * @return {String}    The background color
	 */
	CIQ.getBackgroundColor=function(el){
		var bgColor=null;
		while(!bgColor || CIQ.isTransparent(bgColor)){
			var cStyle=getComputedStyle(el);
			if(!cStyle) return;
			bgColor=cStyle.backgroundColor;
			if(CIQ.isTransparent(bgColor)) bgColor="transparent";
			el=el.parentNode;
			if(!el || !el.tagName) break;
		}
		if(!bgColor || bgColor=="transparent") bgColor="#FFFFFF";
		return bgColor;
	};

	/* TOC()************* DATE/TIME FORMATTERS ************** */
	
	CIQ.yyyymmddhhmmssmmmrx=new RegExp("\\d{17}");

	/**
	 * Converts a string form date into a JavaScript Date object with time. Supports various standard date formats
	 * @param  {string} dt String form of a date (such as yyyymmddhhmm, yyyy-mm-dd hh:mm, etc)
	 * @return {date}    A JavaScript Date object
	 * @memberOf  CIQ
	 */
	CIQ.strToDateTime=function(dt){
		if(!dt || dt.getFullYear) return dt;  //if passing in a JS date, return it.
		var myDateArray=[];
		var y,m,d,h,mn,sc,ms;
		if(dt.length==12){	// yyyymmddhhmm
			y=parseFloat(dt.substring(0,4));
			m=parseFloat(dt.substring(4,6)) - 1;
			d=parseFloat(dt.substring(6,8));
			h=parseFloat(dt.substring(8,10));
			mn=parseFloat(dt.substring(10,12));
			return new Date(y, m, d, h, mn, 0, 0);
		}else if(CIQ.yyyymmddhhmmssmmmrx.test(dt)){
			y=parseFloat(dt.substring(0,4));
			m=parseFloat(dt.substring(4,6)) - 1;
			d=parseFloat(dt.substring(6,8));
			h=parseFloat(dt.substring(8,10));
			mn=parseFloat(dt.substring(10,12));
			sc=parseFloat(dt.substring(12,14));
			ms=parseFloat(dt.substring(14,17));
			return new Date(y, m, d, h, mn, sc, ms);
		}else{
			var lr=[dt];
			var t=dt.indexOf("T");
			if(t!=-1){
				var afterT=dt.substring(t);
				if(!CIQ.isIE8 && (afterT.indexOf("Z")!=-1 || afterT.indexOf("-")!=-1 || afterT.indexOf("+")!=-1)){
					return new Date(dt); // utc time if it contains actual timezone information
				}
				lr=dt.split("T");
			}else if(dt.indexOf(" ")!=-1) lr=dt.split(" ");

			if(lr[0].indexOf('/')!=-1) myDateArray=lr[0].split("/");
			else if(lr[0].indexOf('-')!=-1) myDateArray=lr[0].split("-");
			else return CIQ.strToDate(dt); //give up, maybe it's just a date

			var year=parseFloat(myDateArray[2],10);
			if(myDateArray[0] && myDateArray[0].length==4){	// YYYY-MM-DD
				year=parseFloat(myDateArray[0],10);
				myDateArray[0]=myDateArray[1];
				myDateArray[1]=myDateArray[2];
			}

			if(lr.length>1){
				var ampm=lr[2];
				lr=lr[1].split(':');
				if(ampm){
					if(lr[0]=="12" && ampm.toUpperCase()=="AM") lr[0]=0;
					else if(lr[0]!="12" && ampm.toUpperCase()=="PM") lr[0]=parseInt(lr[0],10)+12;
				}
				var sec=0,msec=0;
				if(lr.length==3){
					if(lr[2].indexOf(".")==-1){
						sec=parseInt(lr[2],10);
					}else{
						sec=lr[2].split(".");
						if(sec[1].length==3){
							msec=sec[1];
							sec=sec[0];
						}else{  //only IE8 should get here
							msec=sec[1].substr(0,3);
							var tz=parseInt(sec[1].substr(3),10);
							sec=sec[0];
							var rDt=new Date(year, myDateArray[0]-1, myDateArray[1], lr[0], lr[1], sec, msec);
							rDt.setMinutes(rDt.getMinutes()-rDt.getTimezoneOffset()-tz%100-Math.round(tz/100)*60);
							return rDt;
						}
					}
				}
				return new Date(year,myDateArray[0]-1,myDateArray[1], lr[0], lr[1], sec, msec);
			}else{
				return new Date(year,myDateArray[0]-1,myDateArray[1], 0, 0, 0, 0);
			}
		}
	};

	/**
	 * Converts a string form date into a JavaScript object. Only use if you know that the string will not include a time, otherwise use @see CIQ.strToDateTime
	 * @param  {string} dt - Date in string format such as MM/DD/YY or YYYYMMDD or 2014-10-25T00:00:00+00:00 or 201506170635
	 * @return {Date}    JavaScript date object -new Date()-
	 * @memberOf  CIQ
	 */
	CIQ.strToDate=function(dt){
		var myDateArray;
		if(dt.indexOf('/')!=-1) myDateArray=dt.split("/");
		else if(dt.indexOf('-')!=-1) myDateArray=dt.split("-");
		else if(dt.length>=8){
			return new Date(parseFloat(dt.substring(0,4)), parseFloat(dt.substring(4,6))-1, parseFloat(dt.substring(6,8)));
		}else{
			return new Date();
		}
		if(myDateArray.length< 3){  // didn't find enough data for month, day and year.
			return new Date();
		}
		if(myDateArray[2].indexOf(' ')!=-1){
			myDateArray[2]=myDateArray[2].substring(0, myDateArray[2].indexOf(' '));
		} else if(myDateArray[2].indexOf('T')!=-1){
			myDateArray[2]=myDateArray[2].substring(0, myDateArray[2].indexOf('T'));
		}
		var year=parseFloat(myDateArray[2],10);
		if(year<20) year+=2000;
		if(myDateArray[0].length==4){	// YYYY-MM-DD
			year=parseFloat(myDateArray[0],10);
			myDateArray[0]=myDateArray[1];
			myDateArray[1]=myDateArray[2];
		}
		return new Date(year,myDateArray[0]-1,myDateArray[1]);
	};

	/**
	 * Converts a JavaScript Date or string form date to mm/dd/yyyy format
	 * @param  {string} d Date in JavaScript Date or string format such as YYYY-MM-DD
	 * @return {string}   Date in mm/dd/yyyy format
	 * @memberOf  CIQ
	 * @since 2016-07-16
	 */
	CIQ.mmddyyyy=function(dt){
		if(typeof(dt) === 'string'){
			dt = CIQ.strToDate(dt);
		}
		
		var m=dt.getMonth()+1;
		if(m<10) m="0" + m;
		d=dt.getDate();
		if(d<10) d="0" + d;
		return m + "/" + d + "/" + dt.getFullYear();
	};

	/**
	 * Converts a JavaScript Date to yyyy-mm-dd format
	 * @param  {date} dt JavaScript Date object
	 * @return {string}    Date in yyyy-mm-dd format
	 * @memberOf  CIQ
	 */
	CIQ.yyyymmdd=function(dt){
		var m=dt.getMonth()+1;
		if(m<10) m="0" + m;
		var d=dt.getDate();
		if(d<10) d="0" + d;
		return dt.getFullYear() + "-" + m + "-" + d;
	};

	/**
	 * Converts a date into yyyymmddhhmm format
	 * @param  {date} dt A JavaScript Date object
	 * @return {string}    Date in yyyymmddhhmm format
	 * @memberOf  CIQ
	 */
	CIQ.yyyymmddhhmm=function(dt){
		var m=dt.getMonth()+1;
		if(m<10) m="0" + m;
		var d=dt.getDate();
		if(d<10) d="0" + d;
		var h=dt.getHours();
		if(h<10) h="0" + h;
		var mn=dt.getMinutes();
		if(mn<10) mn="0" + mn;
		return '' + dt.getFullYear() + m + d + h + mn;
	};

	/**
	 * Converts a date into yyyymmddhhmmssmmm format
	 * @param  {date} dt A JavaScript Date object
	 * @return {string}    Date in yyyymmddhhmmssmmm format
	 * @memberOf  CIQ
	 */
	CIQ.yyyymmddhhmmssmmm=function(dt){
		var m=dt.getMonth()+1;
		if(m<10) m="0" + m;
		var d=dt.getDate();
		if(d<10) d="0" + d;
		var h=dt.getHours();
		if(h<10) h="0" + h;
		var mn=dt.getMinutes();
		if(mn<10) mn="0" + mn;
		var s=dt.getSeconds();
		if(s<10) s="0" + s;
		var ms=dt.getMilliseconds();
		if(ms<10) ms="00" + ms;
		else if(ms<100) ms="0" + ms;
		return '' + dt.getFullYear() + m + d + h + mn + s + ms;
	};

	/**
	 * Converts a date into yyyy/mm/dd hh:mm format
	 * @param  {date} dt A JavaScript Date object
	 * @return {string}    Date in yyyy/mm/dd hh:mm format
	 * @memberOf  CIQ
	 */
	CIQ.friendlyDate=function(dt){
		var m=dt.getMonth()+1;
		if(m<10) m="0" + m;
		var d=dt.getDate();
		if(d<10) d="0" + d;
		var h=dt.getHours();
		if(h<10) h="0" + h;
		var mn=dt.getMinutes();
		if(mn<10) mn="0" + mn;
		return '' + dt.getFullYear() + "/" + m + "/" + d + " " + h + ":" + mn;
	};

	/**
	 * Converts a date into YYYY-MM-DDTHH:MM:SSZ format (UTC)
	 * @param  {date} dt A JavaScript Date object
	 * @return {string}    Date in YYYY-MM-DDTHH:MM:SSZ format
	 * @memberOf  CIQ
	 */
	CIQ.standardUTCDate=function(dt){
		var m=dt.getUTCMonth()+1;
		if(m<10) m="0" + m;
		var d=dt.getUTCDate();
		if(d<10) d="0" + d;
		var h=dt.getUTCHours();
		if(h<10) h="0" + h;
		var mn=dt.getUTCMinutes();
		if(mn<10) mn="0" + mn;
		var s=dt.getUTCSeconds();
		if(s<10) s="0" + s;
		return '' + dt.getUTCFullYear() + "-" + m + "-" + d + "T" + h + ":" + mn + ":" + s + "Z";
	};

	/**
	 * Converts a string form date into mm-dd hh:mm format
	 * @param  {string} strdt Date in string format (such as yyyymmddhhmm, yyyy-mm-dd hh:mm, etc)
	 * @return {string}       Date in mm-dd hh:mm format
	 * @memberOf  CIQ
	 */
	CIQ.mmddhhmm=function(strdt){
		var dt=CIQ.strToDateTime(strdt);
		var m=dt.getMonth()+1;
		if(m<10) m="0" + m;
		var d=dt.getDate();
		if(d<10) d="0" + d;
		var h=dt.getHours();
		if(h<10) h="0" + h;
		var mn=dt.getMinutes();
		if(mn<10) mn="0" + mn;
		if(h=="00" && mn=="00") return m + "-" + d + "-" + dt.getFullYear();
		return m + "-" + d + " " + h + ":" + mn;
	};

	/**
	 * Gets the day of the year
	 * @param  {Date} [dt] optional	The date to check.  If omitted, will use the current date.
	 * @return {number} 			Day of year
	 * @memberOf  CIQ
	 */
	CIQ.getYearDay=function(dt){
		var now = dt;
		if(!now) now = new Date();
		now.setHours(0,0,0,0);
		var start = new Date(now.getFullYear(), 0, 0);
		var diff = now - start;
		var oneDay = 1000 * 60 * 60 * 24;
		var day = Math.round(diff / oneDay);
		return day;
	};

	/**
	 * DST checker.  Returns whether input date is in DST
	 * @param  {Date} [dt] optional	The date to check.  If omitted, will use the current date.
	 * @return {boolean} True for DST, false for not.
	 * @memberOf  CIQ
	 */
	CIQ.isDST=function(dt){
		if(!dt) dt=new Date();
		var jan = new Date(dt.getFullYear(), 0, 1);
		var jul = new Date(dt.getFullYear(), 6, 1);
		var stdOffset=Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
		return dt.getTimezoneOffset() != stdOffset;
	};
	
	/* TOC()************* UNIQUE STRING ************** */

	/**
	 * Returns a short, pseudo unique ID based on the current time. Radix 36 is used resulting in a compact string consisting only of letters and numerals.
	 * While not guaranteed to be unique, this function has a high probability of uniqueness when it is triggered by human activity even in a large user base.
	 * @return {string} A unique string consisting of letters and numerals
	 * @memberOf  CIQ
	 */
	CIQ.uniqueID=function(){
		var epoch=new Date();
		var id=epoch.getTime().toString(36);
		id+=Math.floor(Math.random()*Math.pow(36,2)).toString(36);
		return id.toUpperCase();
	};

	/* TOC()************* URL/XHR ************** */

	/**
	 * Returns the host portion of a url
	 * @param  {string} url The url, such as document.location.href
	 * @return {string}     The host portion, including port, if the url is a valid URI
	 * @memberOf  CIQ
	 */
	CIQ.getHostName=function(url) {
		try{
			return url.match(/:\/\/(.[^/]+)/)[1];
		}catch(e){
			return "";
		}
	};

	/**
	 * Gets an Ajax server dependent on browser method. If IE9 and a cross domain request then XDomainRequest() will be used
	 * rather than XMLHttpRequest.
	 * @param  {string} url The url to connect with
	 * @return {object}     An ajax server
	 * @memberOf  CIQ
	 */
	CIQ.getAjaxServer=function(url){
		var server=false;
		var crossDomain=true;
		if((CIQ.isIE9 || CIQ.isIE8) && url){
			if(CIQ.getHostName(url)==="") crossDomain=false;
			if(CIQ.getHostName(url)==CIQ.getHostName(window.location.href)) crossDomain=false;
		}
		if((CIQ.isIE9 || CIQ.isIE8) && crossDomain){
			server = new XDomainRequest();
			return server;
		}
		try{
			//All modern browsers (IE7+, Firefox, Chrome, Safari, and Opera) have a built-in XMLHttpRequest object.
			server = new XMLHttpRequest();
		}catch(e){
			alert("ajax not supported in browser");
		}
		return server;
	};

	/**
	 * A parsed query string object
	 * Does not support using multi-value keys (i.e. "a=1&a=2")
	 * @param  {string} [query] Query string. If not provided then the browser location's query string will be used
	 * @return {object}       An object containing the parsed values of the query string
	 * @memberOf  CIQ
	 */
	CIQ.qs=function(query) {
		var qsParm = {};
		if(!query) query = window.location.search.substring(1);
		var parms = query.split('&');
		for (var i=0; i<parms.length; i++) {
			var pos = parms[i].indexOf('=');
			var key;
			if (pos > 0) {
				key = parms[i].substring(0,pos);
				qsParm[key] = parms[i].substring(pos+1);
			}else{
				key = parms[i];
				qsParm[key] = null;
			}
		}
		return qsParm;
	};

	/**
	 * @callback CIQ.postAjax~requestCallback
	 * @param {number} status HTTP status
	 * @param {string} response HTTP response
	 */
	/**
	 * Convenience function for making an ajax post. If payload is non-null then the method will be set to POST, otherwise GET. Cross origin
	 * ajax is support on IE9.
	 * @param {object} params Parameters for the post
	 * @param  {string}   params.url         The url to send the ajax query to
	 * @param  {string}   [params.payload]     An optional payload to send
	 * @param  {CIQ.postAjax~requestCallback} params.cb          Callback function when complete
	 * @param  {string}   [params.contentType] Optionally override the content type
	 * @param  {boolean}   [params.noEpoch]     By default the epoch is appended as a query string to bust caching. Set this to false to not append the epoch.
	 * @param {array} [params.headers] Optional additional HTTP headers to send
	 * @memberOf  CIQ
	 */
	CIQ.postAjax=function(params, arg1, arg2, arg3, arg4){
		if(typeof params=="string"){
			params={
				url: params,
				payload: arg1,
				cb: arg2,
				contentType: arg3,
				noEpoch: arg4,
				method: null,
				responseHeaders: false
			};
		}
		var url=params.url, cb=params.cb, payload=params.payload;
		function parseHeaders(server){
			//Optional code for processing headers. Doesn't work for IE9
			var headers={};
			if(!params.responseHeaders) return;
			var headerString=server.getAllResponseHeaders();
			var headerArray=headerString.split("\n");
			for(var i=0;i<headerArray.length;i++){
				var split=headerArray[i].split(":");
				while(split[1] && split[1].charAt(0)==' ') split[1]=split[1].substring(1);
				if(split[0]!=="") {
					headers[split.shift()]=split.join(":");
				}
			}
			return headers;
		}
		var server=CIQ.getAjaxServer(url);
		if(!server) return false;
		var epoch=new Date();
		if(!params.noEpoch){
			if(url.indexOf('?')==-1) url+="?" + epoch.getTime();
			else url+="&" + epoch.getTime();
		}
		var method=params.method, headers=params.headers;
		if(!method) method=payload?"POST":"GET";
		if((!CIQ.isIE9 && !CIQ.isIE8) || server.constructor==XMLHttpRequest){
			server.open(method, url, true);
			if(!params.contentType) params.contentType='application/x-www-form-urlencoded';
			if(payload) server.setRequestHeader('Content-Type', params.contentType);
			if(headers){
				for(var header in headers){
					server.setRequestHeader(header, headers[header]);
				}
			}
		}else{
			url=url.replace("https:",window.location.protocol);
			server.open(method, url, true);
			server.onload=function(){
				cb(200, server.responseText, parseHeaders(server));
			};
			server.onerror=function(){
				cb(0, null, {});
			};
			server.onprogress=function(){};
		}
		server.onreadystatechange=function(){
			if(server.readyState==4){
				if(server.status!=200){
					cb(server.status, server.responseText, parseHeaders(server));
				}else{
					cb(200, server.responseText, parseHeaders(server));
				}
			}
		};
		try{
			server.send(payload);
		}catch(e){
			cb(0, e, {});
		}
		return true;
	};

	return _exports;
});