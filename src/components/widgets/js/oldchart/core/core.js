// -------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
(function (definition) {
    "use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('./timezone'),require('./utility'));
	} else if (typeof define === "function" && define.amd) {
		define(['core/timezone','core/utility'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global,global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for core.js.");
	}

})(function(_exports, utility) {
	var CIQ=_exports.CIQ, $$=_exports.$$, $$$=_exports.$$$;
	console.log("core.js",_exports);

	/* TOC()************* MARKET DATE/TIME FORMATTING ************** */

	/**
	 * Gets the current time in Eastern Time Zone. This can be used as a convenience for determining open and closing times of US markets.
	 * @return {date} JavaScript Date representing the time in Eastern Time Zone
	 * @memberOf  CIQ
	 */
	CIQ.getETDateTime=function(){
		var d=new Date();
		return CIQ.convertTimeZone(new Date(d.getTime()+d.getTimezoneOffset()*60000),"UTC","America/New_York");
	};

	/**
	 * Converts a JavaScript date from Eastern Time Zone to the browser's local time zone. Daylight Savings Time is hard coded. @see CIQ.getETDateTime
	 * @param  {date} est JavaScript Date object representing a date/time in eastern time zone
	 * @return {date}     JavaScript Date object converted to browser's local time zone
	 * @memberOf  CIQ
	 */
	CIQ.fromET=function(est){
		var d=new Date();
		//var localTime = d.getTime();
		//var localOffset = d.getTimezoneOffset() * 60000;
		//var utc = localTime + localOffset;
		var offset = 4;
		if((d.getMonth()<2 || (d.getMonth()==2 && d.getDate()<11)) || (d.getMonth()>10 || (d.getMonth()==10 && d.getDate()>=4)))
				offset = 5;
		var localTime = est.getTime() + (3600000*offset);
		var nd = new Date(localTime);
		return nd;
	};

	/**
	 * Converts a future month to the month index or vice versa.  Month indexes begin with 1 for January
	 * @param  {char} x 	The value to convert.  If numeric, will convert to Future month letter.  If Alpha, will convert to month index.
	 * @return {char} 		Converted value
	 * @memberOf  CIQ
	 */
	CIQ.convertFutureMonth=function(x){
		var y=x.toString();
		if(y.length<=0 || y.length>2) return "";
		switch(y){
		case '1': return "F";
		case '2': return "G";
		case '3': return "H";
		case '4': return "J";
		case '5': return "K";
		case '6': return "M";
		case '7': return "N";
		case '8': return "Q";
		case '9': return "U";
		case '10': return "V";
		case '11': return "X";
		case '12': return "Z";
		case 'F': return "1";
		case 'G': return "2";
		case 'H': return "3";
		case 'J': return "4";
		case 'K': return "5";
		case 'M': return "6";
		case 'N': return "7";
		case 'Q': return "8";
		case 'U': return "9";
		case 'V': return "10";
		case 'X': return "11";
		case 'Z': return "12";
		}
		return y;
	};

	
	/* TOC()************* MONEY FORMATTING ************** */

	/**
	 * Prints out a number in US Dollar monetary representation
	 * @param  {number} val      The amount
	 * @param  {number} [decimals=2] Optional number of decimal places.
	 * @param  {string} [currency] Optional currency designation.  If omitted, will use $.
	 * @return {string}          US Dollar monetary representation
	 * // Returns $100.00
	 * CIQ.money(100, 2);
	 * @memberOf  CIQ
	 */
	CIQ.money=function(val, decimals, currency){
		if(!currency) currency="$";
		if(currency.length==3) currency+=" ";
		if(!decimals && decimals!==0) decimals=2;
		return currency + CIQ.commas((Math.round(val*10000)/10000).toFixed(decimals));
	};

	/**
	 * Converts a currency code from ISO to char
	 * @param  {string} code      The string to convert, e.g. USD
	 * @return {string}          The converted string, e.g. $
	 * @memberOf  CIQ
	 */
	CIQ.convertCurrencyCode=function(code){
		var codes={JPY:"¥",USD:"$",AUD:"A$",BRL:"R$",CAD:"CA$",CNY:"CN¥",CZK:"Kč",DKK:"kr",EUR:"€",GBP:"£",HKD:"HK$",HUF:"Ft",ILS:"₪",INR:"₹",KRW:"₩",MXN:"MX$",NOK:"kr",NZD:"NZ$",PLN:"zł",RUB:"руб",SAR:"﷼",SEK:"kr",SGD:"S$",THB:"฿",TRY:"₺",TWD:"NT$",VND:"₫",XAF:"FCFA",XCD:"EC$",XOF:"CFA",XPF:"CFPF",ZAR:"R"};
		var rt=codes[code];
		if(rt) return rt;
		else return code;
	};

	/**
	 * Returns a string representation of a number with commas in thousands, millions or billions places. Note that this function does
	 * not handle values with more than 3 decimal places!!!
	 * @param  {number} val The value
	 * @return {string}     The result with commas
	 * @example
	 * // Returns 1,000,000
	 * CIQ.commas(1000000);
	 * @memberOf  CIQ
	 */
	CIQ.commas=function(val){
		return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	};


	/* TOC()************* EVENT HANDLING ************** */

	/**
	 * User friendly alerts. The charting engine always uses this instead of alert() for warning or error messages. This
	 * method can be overriden as required by your user interface.
	 * @param  {string} text Alert message
	 * @example
	 * // Override with a friendlier alert mechanism!
	 * CIQ.alert=function(text){
	 * 	doSomethingElse(text);
	 * }
	 * @memberOf  CIQ
	 */
	CIQ.alert=function(text){
		alert(text);
	};

	/**
	 * Returns true if a point, in absolute screen position, is within an element
	 * @param  {object} node A valid DOM element to check whether the point overlaps
	 * @param  {number} x    Absolute screen X position of point
	 * @param  {number} y    Absolute screen Y position of pointer
	 * @return {boolean}      True if the point lies inside of the DOM element
	 * @memberOf  CIQ
	 */
	CIQ.withinElement=function(node, x, y){
		var rect=node.getBoundingClientRect();
		if(x<=rect.left) return false;
		if(y<=rect.top) return false;
		if(x>=rect.left+node.offsetWidth) return false;
		if(y>=rect.top+node.offsetHeight) return false;
		return true;
	};

	/**
	 * Used in conjunction, safeMouseOut and safeMouseOver ensure just a single event when the mouse moves
	 * in or out of an element. This is important because simple mouseout events will fire when the mouse
	 * crosses boundaries *within* an element. Note that this function will do nothing on a touch device where
	 * mouseout is not a valid operation.
	 * @param  {object} node A valid DOM element
	 * @param  {function} fc   Function to call when the mouse has moved out
	 * @memberOf  CIQ
	 */
	CIQ.safeMouseOut=function(node, fc){
		function closure(node, fc){
			return function(e){
				if(typeof e.pageX=="undefined"){
					e.pageX=e.clientX;
					e.pageY=e.clientY;
				}
				if(CIQ.withinElement(node, e.pageX, e.pageY)){
					return;
				}
				node.stxMouseOver=false;
				fc(e);
			};
		}
		node.addEventListener("mouseout", closure(node, fc));
	};

	/**
	 * This method is guaranteed to only be called once when a user mouses over an object. @see CIQ#safeMouseOut
	 * @param  {object} node A valid DOM element
	 * @param  {function} fc   Function to call when mouse moves over the object
	 * @memberOf  CIQ
	 */
	CIQ.safeMouseOver=function(node, fc){
		function closure(node, fc){
			return function(e){
				if(typeof e.pageX=="undefined"){
					e.pageX=e.clientX;
					e.pageY=e.clientY;
				}
				if(CIQ.withinElement(node, e.pageX, e.pageY)){
					if(node.stxMouseOver) return;
					node.stxMouseOver=true;
					fc(e);
				}
			};
		}
		node.addEventListener("mouseover", closure(node, fc));
	};

	/**
	 * Converts an object to emit "stxtap" events. This uses {@link CIQ#safeClickTouch}. You should use addEventListener("tap") to receive the events.
	 * @param {HTMLElement} div The element to convert
	 * @param {Object} [params] Optional parameters to pass to {@link CIQ#safeClickTouch}
	 * @param {Boolean} [params.stopPropagation=false] If set to true then propagation will be stopped
	 * @since  04-2015
	 */
	CIQ.installTapEvent=function(div, params){
		var fc=function(e){
			var ev = document.createEvent('Event');
			ev.initEvent("stxtap", true, true);
			if(typeof e.pageX=="undefined"){
				e.pageX=e.clientX;
				e.pageY=e.clientY;
			}
			ev.pageX = e.pageX;
			ev.pageY = e.pageY;
			e.target.dispatchEvent(ev);
			if(params && params.stopPropagation) e.stopPropagation();
		};
		CIQ.safeClickTouch(div, fc, params);
	};
	/**
	 * Use this instead of onclick or ontouch events. This function will automatically use the quickest available
	 * but also protect against being called twice.
	 * By default any previous safeClickTouch listeners will be cleared (to allow re-use of the element).
	 * @param {object} div The DOM element to attach an event
	 * @param {Function} fc The function to call when the object is pressed
	 * @param {object} params Parameters to drive behavior.
	 * @param {object} [params.safety] An optional object, generated from a CIQ.safeDrag association to prevent the click from being triggered when a drag operation is released
	 * @param {boolean} [params.allowMultiple=false] If set then multiple click events can be associated with the node
	 * @param {boolean} [params.preventUnderlayClick=true] By default prevents an underlaying element from being "clicked" on a touch device 400ms after the overlay was tapped. Set to false for input fields, or any div containing input fields (body)
	 * @param {boolean} [params.absorbDownEvent=true] Ensures that a mousedown, pointerdown, touchstart event doesn't get passed to the parent.
	 * @memberOf  CIQ
	 * @since 11/01/2015 Removed timers in favor of a new algorithm. This algorithm allows only the first event to fire from a UI interaction to execute the fc function.
	 */
	CIQ.safeClickTouch=function(div, fc, params){
		if(!params) params={};

		if(!params.allowMultiple) CIQ.clearSafeClickTouches(div);
		if(params.preventUnderlayClick!==false) params.preventUnderlayClick=true;
		if(params.absorbDownEvent!==false) params.absorbDownEvent=true;
		params.allowAnotherDevice=0;
		params.registeredClick=false;
		function closure(which, params){
			return function(e){
				if(!CIQ.safeClickTouchEvent){
					if(!e.target.stxPressed) return;  // is this up/end event related to a down/start event?
					var timeSincePressed=e.target.stxPressed.time;
					e.target.stxPressed=null;
					if(timeSincePressed+1000<new Date().getTime()) return; //allow no more than 1 second for click
				}
				if(params.safety && params.safety.recentlyDragged) return;
				if(!e) e=event;
				if((e.which && e.which>=2) || (e.button && e.button>=2)) return; // ignore right clicks
				if(params.preventUnderlayClick){
					e.preventDefault();
				}else{ // prevent touch and mouse from being clicked when we can't use preventDefault
					if(params.lastType!=which && Date.now()<params.allowAnotherDevice) return;
					params.lastType=which;
					params.allowAnotherDevice=Date.now()+1000; // 1 Second then not a coat tail mouse click
				}
				(fc)(e);
			};
		}
		function isClick(down){
			return function(e){
				if(down) e.target.stxPressed={
						time:new Date().getTime(),
						x:e.clientX,
						y:e.clientY
				};
				else if(e.target.stxPressed){
					//allow no more than 4 pixel distance movement
					if((Math.pow(e.target.stxPressed.x-e.clientX,2)+Math.pow(e.target.stxPressed.y-e.clientY,2))>16)
						e.target.stxPressed=null;
				}
			};
		}
		var safeClickTouchEvents=div.safeClickTouchEvents
		if(!safeClickTouchEvents) safeClickTouchEvents=div.safeClickTouchEvents=[];
		var fc1=closure("mouseup", params);
		var fc2=closure("touchend", params);
		var fc3=closure("pointerup", params);
		var f=function(e){ e.stopPropagation(); };
		var eventHolder={};
		if(CIQ.safeClickTouchEvent){ // global override for which event to use, for instance if you want to force use of "click" or "tap"
			var fc4=closure(CIQ.safeClickTouchEvent, params);
			div.addEventListener(CIQ.safeClickTouchEvent, fc4);
			eventHolder[CIQ.safeClickTouchEvent]=fc4;
			safeClickTouchEvents.push(eventHolder);
		}else if("onpointerup" in document){
			// Internet Explorer can always use pointerup safely
			div.addEventListener("pointerdown", isClick(true));
			div.addEventListener("pointermove", isClick());
			div.addEventListener("pointerup", fc3);
			eventHolder.pointerup=fc3;
			if(params.absorbDownEvent){
				div.addEventListener("pointerdown", f);
				eventHolder.pointerdown=f;
			}
			safeClickTouchEvents.push(eventHolder);
		}else{
			// all in one computers can support both of these under Chrome/FF!
			div.addEventListener("mousedown", isClick(true));
			div.addEventListener("mousemove", isClick());
			div.addEventListener("touchstart", isClick(true));
			div.addEventListener("touchmove", isClick());
			div.addEventListener("mouseup", fc1);
			div.addEventListener("touchend", fc2);
			eventHolder.mouseup=fc1;
			eventHolder.touchend=fc2;
			if(params.absorbDownEvent){
				div.addEventListener("mousedown", f);
				eventHolder.mousedown=f;
				div.addEventListener("touchstart", f);
				eventHolder.touchstart=f;
			}
			safeClickTouchEvents.push(eventHolder);
		}
	};

	/**
	 * Clears all safeClickTouch events from a DOM element.
	 * @param  {object} div The DOM element to clear events
	 * @memberOf  CIQ
	 */
	CIQ.clearSafeClickTouches=function(div){
		var safeClickTouchEvents=div.safeClickTouchEvents;
		if(!safeClickTouchEvents) return;
		for(var i=0;i<safeClickTouchEvents.length;i++){
			var fc=safeClickTouchEvents[i];
			for(var e in fc){
				var f=fc[e];
				div.removeEventListener(e, f);
			}
		}
		div.safeClickTouchEvents=null;
	};

	/**
	 * Safe function to handle dragging of objects on the screen. This method is cross-device aware and can handle mouse or touch drags.
	 * This method does not actually move the objects but provides callbacks that explain when drag operations
	 * begin and cease, and what movements are made during the drag. Callbacks should be used to move the actual objects
	 * (if it is desired to move objects during a drag operation). For convenience, displacementX and displacementY are added to callback events
	 * to indicate the distance from the original starting point of the drag.
	 * A "safety" object is returned which can optionally be passed into CIQ.safeClickTouch to prevent errant click events
	 * from being triggered when a user lets go of a drag
	 * @param  {object} div    The draggable DOM element
	 * @param  {function} [fcDown] Callback function when a drag operation begins. Receives an event object.
	 * @param  {function} [fcMove] Callback function when a drag move occurs. Receives an event object.
	 * @param  {function} [fcUp]   Callback function when the drag operation ends. Receives an event object.
	 * @return {object}        Safety object which can be passed to CIQ.safeClickTouch
	 * @memberOf  CIQ
	 */
	CIQ.safeDrag=function(div, fcDown, fcMove, fcUp){
		var resetMS=100;	// To avoid multiple down events only one can occur per 100ms
		var registeredClick=false;
		var startX=0, startY=0;
		var safety={
			recentlyDragged: false
		};
		function closure(moveEvent){
			var fmap={
				"mousedown": {"move":"mousemove", "up": "mouseup"},
				"pointerdown": {"move":"pointermove", "up": "pointerup"},
				"touchstart": {"move":"touchmove", "up": "touchend"}
			};
			function pageX(e){
				if(e.touches){
					if(e.touches.length>=1){
						return e.touches[0].pageX;
					}else if(e.changedTouches && e.changedTouches.length>=1){
						return e.changedTouches[0].pageX;
					}
				}
				if(typeof e.pageX=="undefined"){
					return e.clientX;
				}
				return e.pageX;
			}
			function pageY(e){
				if(e.touches){
					if(e.touches.length>=1){
						return e.touches[0].pageY;
					}else if(e.changedTouches && e.changedTouches.length>=1){
						return e.changedTouches[0].pageY;
					}
				}
				if(typeof e.pageY=="undefined"){
					return e.clientY;
				}
				return e.pageY;
			}
			return function(e){
				if(registeredClick) return;
				registeredClick=true;
				CIQ.ChartEngine.ignoreTouch=true;
				var moveFC=function(e){
					if(e && e.preventDefault) e.preventDefault();
					safety.recentlyDragged=true;
					e.displacementX=pageX(e)-startX;
					e.displacementY=pageY(e)-startY;
					(fcMove)(e); // Call the move event
				};
				if(fcMove) document.body.addEventListener(fmap[moveEvent].move, moveFC);
				document.body.addEventListener(fmap[moveEvent].up, function(e){	// Create an up listener on the body
					CIQ.ChartEngine.ignoreTouch=false;
					if(fcMove) document.body.removeEventListener(fmap[moveEvent].move, moveFC);	// Remove the move listener since our move is now complete
					document.body.removeEventListener(fmap[moveEvent].up, arguments.callee);	// Remove the up listener since our move is now complete
					e.displacementX=pageX(e)-startX;
					e.displacementY=pageY(e)-startY;
					if(fcUp) (fcUp)(e); // Call the up event
					setTimeout(function(safety){ return function(){safety.recentlyDragged=false;};}(safety), 50);	// Prevent errant clicks from touch letting go
				});
				setTimeout(function(){
					registeredClick=false;
				}, resetMS);
				startX=pageX(e); startY=pageY(e);
				if(fcDown) (fcDown)(e);
			};
		}
		div.addEventListener("mousedown", closure("mousedown"));
		div.addEventListener("pointerdown", closure("pointerdown"));
		div.addEventListener("touchstart", closure("touchstart"));
		return safety;
	};

	if(CIQ.isSurface){
		CIQ.gesture=new MSGesture();
		CIQ.gesture.target=document.body;
		CIQ.gesturePointerId=null;
	}

	/**
	 * Captures enter key events. Also clears the input box on escape key.
	 * @param {object} node The DOM element to attach the event to. Should be a text input box.
	 * @param {Function} cb Callback function when enter key is pressed.
	 * @memberOf  CIQ
	 */

	CIQ.inputKeyEvents=function(node, cb){
	    node.addEventListener("keyup", function(e){
		    var key = (window.event) ? event.keyCode : e.keyCode;
		    switch(key){
			    case 13:
				    cb();
				    break;
	            case 27:
	                node.value="";
	                break;
			    default:
				    break;
		    }
	    }, false);
	};

	/* TOC()************* SCREEN/CURSOR POSITIONING ************** */

	/**
	 * Fixes screen scroll. This can occur when the keyboard opens on an ipad or iphone.
	 * @memberOf  CIQ
	 */
	CIQ.fixScreen=function(){
		window.scrollTo(0,0);
	};

	/**
	 * Sets the position of the cursor within a textarea box. This is used for instance to position the cursor at the
	 * end of the text that is in a textarea.
	 * @param {object} ctrl A valid textarea DOM element
	 * @param {number} pos  The position in the text area to position
	 * @memberOf  CIQ
	 */
	CIQ.setCaretPosition=function(ctrl, pos){
		ctrl.style.zIndex=5000;
		if(ctrl.setSelectionRange){
			CIQ.focus(ctrl);
			try{
				ctrl.setSelectionRange(pos,pos);
			}catch(e){}
		}else if (ctrl.createTextRange) {
			var range = ctrl.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	};

	/**
	 * Sets the value of an input box only if it is not active. This prevents an input box from changing underneath
	 * a user, which can be extremely frustrating on touch devices.
	 * @param {HTMLElement} el    The input element
	 * @param {string} value The value to set
	 */
	CIQ.setValueIfNotActive=function(el, value){
		if(document.activeElement==el) return;
		el.value=value;
	};

	/**
	 * Closes the keyboard on a touch device by blurring any active input elements.
	 * @param {HTMLElement} newFocus optional element to change focus to
	 * @memberOf  CIQ
	 */
	CIQ.hideKeyboard=function(newFocus){
		var element=document.activeElement;
		if(element.tagName=="INPUT" || element.tagName=="TEXTAREA"){
			element.blur();
			window.focus();
			if(newFocus){
				if(newFocus===document.body || document.body.contains(newFocus)) newFocus.focus();
			}
		}
	};

	/* TOC()************* INTERSECTION UTILITIES ************** */

	/**
	 * Determines whether a line intersects a box. This is used within the charting engine to determine whether the cursor
	 * has intersected a drawing.
	 * @param  {number} bx1
	 * @param  {number} by1
	 * @param  {number} bx2
	 * @param  {number} by2
	 * @param  {number} x0
	 * @param  {number} y0
	 * @param  {number} x1
	 * @param  {number} y1
	 * @param  {string} vtype - Either "segment", "ray" or "line"
	 * @return {boolean}       Returns true if the line intersects the box
	 * @memberOf  CIQ
	 */
	CIQ.boxIntersects=function(bx1, by1, bx2, by2, x0, y0, x1, y1, vtype){
		var linesIntersect=CIQ.linesIntersect;
		if     (linesIntersect(bx1, bx2, by1, by1, x0, x1, y0, y1, vtype)) return true;
		else if(linesIntersect(bx1, bx2, by2, by2, x0, x1, y0, y1, vtype)) return true;
		else if(linesIntersect(bx1, bx1, by1, by2, x0, x1, y0, y1, vtype)) return true;
		else if(linesIntersect(bx2, bx2, by1, by2, x0, x1, y0, y1, vtype)) return true;
		return false;
	};

	/**
	 * Determines whether two lines intersect
	 * @param  {number} x1
	 * @param  {number} x2
	 * @param  {number} y1
	 * @param  {number} y2
	 * @param  {number} x3
	 * @param  {number} x4
	 * @param  {number} y3
	 * @param  {number} y4
	 * @param  {string} type - Either "segment", "ray" or "line"
	 * @return {boolean}      Returns true if the two lines intersect
	 * @memberOf  CIQ
	 */
	CIQ.linesIntersect=function(x1, x2, y1, y2, x3, x4, y3, y4, type){
		var denom  = (y4-y3) * (x2-x1) - (x4-x3) * (y2-y1);
		var numera = (x4-x3) * (y1-y3) - (y4-y3) * (x1-x3);
		var numerb = (x2-x1) * (y1-y3) - (y2-y1) * (x1-x3);
		//var EPS = .000001;

		if(denom===0){
			if(numera===0 && numerb===0) return true; // coincident
			return false; // parallel
		}

		var mua = numera / denom;
		var mub = numerb / denom;
		if(type=="segment"){
			if (mua>=0 && mua<=1 && mub>=0 && mub<=1) return true;
		}else if(type=="line" || type=="horizontal" || type=="vertical"){
			if (mua>=0 && mua<=1) return true;
		}else if(type=="ray"){
			if (mua>=0 && mua<=1 && mub>=0) return true;
		}
		return false;

	};

	/**
	 * Determines the Y value at which point X intersects a line (vector)
	 * @param  {object} vector - Object of type {x0,x1,y0,y1}
	 * @param  {number} x      - X value
	 * @return {number}        - Y intersection point
	 * @memberOf  CIQ
	 */
	CIQ.yIntersection=function(vector, x){
		var x1=vector.x0, x2=vector.x1, x3=x, x4=x;
		var y1=vector.y0, y2=vector.y1, y3=0, y4=10000;
		var denom  = (y4-y3) * (x2-x1) - (x4-x3) * (y2-y1);
		var numera = (x4-x3) * (y1-y3) - (y4-y3) * (x1-x3);
		//var numerb = (x2-x1) * (y1-y3) - (y2-y1) * (x1-x3);
		//var EPS = .000001;

		if(denom===0) return null;

		var mua=numera/denom;
		var y=y1 + (mua * (y2-y1));
		return y;
	};

	/**
	 * Determines the X value at which point Y intersects a line (vector)
	 * @param  {object} vector - Object of type {x0,x1,y0,y1}
	 * @param  {number} y      - Y value
	 * @return {number}        - X intersection point
	 * @memberOf  CIQ
	 */
	CIQ.xIntersection=function(vector, y){
		var x1=vector.x0, x2=vector.x1, x3=0, x4=10000;
		var y1=vector.y0, y2=vector.y1, y3=y, y4=y;
		var denom  = (y4-y3) * (x2-x1) - (x4-x3) * (y2-y1);
		var numera = (x4-x3) * (y1-y3) - (y4-y3) * (x1-x3);
		//var numerb = (x2-x1) * (y1-y3) - (y2-y1) * (x1-x3);
		//var EPS = .000001;

		if(denom===0) return null;
		var mua=numera/denom;
		var x=x1 + (mua * (x2-x1));
		return x;
	};

	/**
	 * Get the X intersection point between two lines
	 * @memberOf  CIQ
	 */
	CIQ.intersectLineLineX = function(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2) {

	    var ua_t = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
	    var u_b  = (by2 - by1) * (ax2 - ax1) - (bx2 - bx1) * (ay2 - ay1);

	    var ua = ua_t / u_b;

	    return ax1 + ua * (ax2 - ax1);
	};

	/**
	 * Get the Y intersection point between two lines
	 * @memberOf  CIQ
	 */
	CIQ.intersectLineLineY = function(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2) {

	    var ua_t = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
	    var u_b  = (by2 - by1) * (ax2 - ax1) - (bx2 - bx1) * (ay2 - ay1);

	    var ua = ua_t / u_b;

	    return ay1 + ua * (ay2 - ay1);
	};


	/* TOC()************* LOCAL STORAGE ************** */

	/**
	 * Set once after user is alerted that private browsing is enabled
	 * @memberOf  CIQ
	 */
	CIQ.privateBrowsingAlert=false;

	// Some browsers don't support localStorage, worse won't let you polyfill (JDK7 webview). So we will create
	// this so that we can add a polyfill.
	CIQ.localStorage=typeof(localStorage)!=="undefined"?localStorage:{};

	/**
	 * Convenience function for storing a name value pair in local storage. This will detect if private browsing is enabled
	 * because localStorage is inoperable under private browsing
	 * @param  {string} name  Name to store
	 * @param  {string} value Value to store
	 * @memberOf  CIQ
	 */
	CIQ.localStorageSetItem=function(name, value){
		try{
			CIQ.localStorage.setItem(name, value);
		}catch(e){
			if(!CIQ.privateBrowsingAlert){
				CIQ.alert("No storage space available.  Possible causes include browser being in Private Browsing mode, or maximum storage space has been reached.");
				CIQ.privateBrowsingAlert=true;
			}
		}
	};


	/* TOC()************* LOADUI ************** */

	/**
	 * Dynamically load UI elements from an external HTML file. This is accomplished by rendering raw HTML in an iframe
	 * and then cloning all of the newly created DOM elements into our main document. The iframe is then removed.
	 *
	 * The title of the iframe is checked. External content should *not* have a title. By convention, 404 or 500 errors
	 * have a title and so we use this to determine whether the iframe contains valid content or not.
	 *
	 * @param  {string}   url The external url to fetch new UI content
	 * @param  {Function} cb  A callback function to call when the new UI is available
	 * @memberOf  CIQ
	 */
	CIQ.loadUI = function(url, cb) {
		var i = document.createElement("iframe");
		var onload = function() {
			var iframeDocument = null;

			try {
				iframeDocument = i.contentDocument || i.contentWindow.document;
			} catch (error) {
				return cb(error);
			}

			if (iframeDocument && !iframeDocument.title) {
				var html = iframeDocument.body.innerHTML;
				var div = document.createElement("div");

				document.body.removeChild(i);
				CIQ.innerHTML(div, html);

				for (var j = 0; j < div.children.length; j++) {
					var ch = div.children[j].cloneNode(true);
					document.body.appendChild(ch);
				}

				cb(null);
			} else {
				cb(new Error('iFrame not found or document has a title'));
			}
		};

		i.src = url + "?" + CIQ.uniqueID();
		i.hidden = true;
		i.addEventListener("load", onload, false);
		document.body.appendChild(i);
	};

	/**
	 * Loads JavaScript dynamically. This method keeps a static memory of scripts that have been loaded
	 * to prevent them from being loaded twice. The callback function however is always called, even if
	 * the script has already been loaded.
	 * @param  {string}   scriptName The url of the script to load
	 * @param  {Function} cb         Callback function to call when the script is loaded
	 * @memberOf  CIQ
	 */
	CIQ.loadScript=function(scriptName, cb){
		if(!CIQ.loadedScripts) CIQ.loadedScripts={};
		if(CIQ.loadedScripts[scriptName]){
			if(cb) cb();
			return;
		}
		var script=document.createElement("SCRIPT");
		script.async = true;
		script.onload=function(){
			CIQ.loadedScripts[scriptName]=true;
			if(cb) cb();
		};
		if(typeof isIE8!="undefined"){
			script.onreadystatechange=function(){
				if(script.readyState=="loaded"){
					CIQ.loadedScripts[scriptName]=true;
					if(cb){
						setTimeout(cb, 0);
					}
				}
			};
		}
		var uniqueName=scriptName;
		// Use the epoch to create a unique query string, which will force the browser to reload
		if(uniqueName.indexOf("?")==-1){
			uniqueName=uniqueName+"?" + Date.now();
		}else{
			uniqueName=uniqueName+"&" + Date.now();
		}
		script.src = uniqueName;
	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(script, s.nextSibling);
	};

	/**
	 * Loads a stylesheet.
	 * @param  {string}   stylesheet Name of stylesheet file.
	 * @param  {Function} cb     Function to call when the stylesheet is fully loaded
	 * @since 2016-03-11
	 * @memberOf  CIQ
	 */
	CIQ.loadStylesheet=function(widget, cb){
		var lnk=document.createElement("link");
		lnk.rel="stylesheet";
		lnk.type="text/css";
		lnk.media="screen";
		lnk.href=widget + "?" + Date.now();
		lnk.onload=function(){
			if(cb) cb();
		};
		var links=document.getElementsByTagName("link");
		var lastLink=links[links.length-1];
		lastLink.parentNode.insertBefore(lnk, lastLink.nextSibling);
	};

	/**
	 * Loads a feature function widget. Feature function widgets consist of a css file, a JS file and an HTML file. This can
	 * be used to dynamically load content and functionality.
	 * @param  {string}   widget Name of widget. The js, css and html files should be this name.
	 * @param  {Function} cb     Function to call when the widget is fully loaded
	 * @memberOf  CIQ
	 */
	CIQ.loadWidget=function(widget, cb){
		CIQ.loadStylesheet(widget+".css",function(){
			CIQ.loadUI(widget + ".html", function(err){
				if(err) cb(err);
				else CIQ.loadScript(widget+".js", cb);
			});
		});
	};

	
	/* TOC()************* CANVAS RENDERING ************** */

	/**
	 * Sets the transparent parts of the canvas to the specified background color. Used to ensure a background when turning charts into images
	 * because normally the background is the background of the DIV container and not the canvas itself.
	 * @param  {object} context An HTML canvas context
	 * @param  {string} color   The color to set the background. Any valid HTML canvas color.
	 * @param  {number} width   Width to apply color (Could be less than size of canvas)
	 * @param  {number} height  Height to apply color (Could be less than size of canvas if applying branding for instance)
	 * @memberOf  CIQ
	 */
	CIQ.fillTransparentCanvas = function(context, color, width, height){
		var compositeOperation = context.globalCompositeOperation;
		context.globalCompositeOperation = "destination-over";
		context.fillStyle = color;
		context.fillRect(0,0,width,height);
		context.globalCompositeOperation = compositeOperation;
	};

	/**
	 * Draws a ticked rectangle on the canvas. For use in the y-axis label.
	 * @param  {object} ctx    A valid HTML Canvas Context
	 * @param  {number} x      Left position of drawing on canvas
	 * @param  {number} y      Top position of drawing on canvas
	 * @param  {number} width  Width of rectangle
	 * @param  {number} height Height of rectangle
	 * @param  {number} radius Radius of rounding
	 * @param  {Boolean} [fill]   Whether to fill the background
	 * @param  {Boolean} [stroke] Whether to fill the outline
	 * @memberOf  CIQ
	 */
	CIQ.tickedRect=function(ctx, x, y, width, height, radius, fill, stroke) {
		CIQ.rect(ctx, x, y, width, height, radius, fill, stroke);
		var tickY=Math.round(y+height/2)+0.5;
		ctx.beginPath();
		ctx.moveTo(x-2, tickY);
		ctx.lineTo(x, tickY);
		ctx.stroke();
		ctx.closePath();
	};

	/**
	 * Draws a rounded rectangle on the canvas.
	 * @param  {object} ctx    A valid HTML Canvas Context
	 * @param  {number} x      Left position of drawing on canvas
	 * @param  {number} y      Top position of drawing on canvas
	 * @param  {number} width  Width of rectangle
	 * @param  {number} height Height of rectangle
	 * @param  {number} radius Radius of rounding
	 * @param  {Boolean} [fill]   Whether to fill the background
	 * @param  {Boolean} [stroke] Whether to fill the outline
	 * @param {Boolean} [edge] "flush","arrow"
	 * @memberOf  CIQ
	 */
	CIQ.roundRect=function(ctx, x, y, width, height, radius, fill, stroke, edge) {
		if (typeof stroke == "undefined" ) {
			stroke = true;
		}
		if (typeof radius === "undefined") {
			radius = 5;
			if(width<0) radius=-5;
		}
		var yradius=width<0?radius*-1:radius;
		if(radius && !edge) x=x-1; // Just a smidge more

		var xr=x+radius, xw=x+width, yr=y+yradius, yh=y+height;
		var xwr=xw-radius, yhr=yh-radius;
		ctx.beginPath();
		ctx.moveTo(xr, y);
		ctx.lineTo(xwr, y);

		ctx.quadraticCurveTo(xw, y, xw, yr);
		ctx.lineTo(xw, yhr);
		ctx.quadraticCurveTo(xw, yh, xwr, yh);
		ctx.lineTo(xr, yh);

		if(edge=="flush"){
			ctx.lineTo(x, yh);
			ctx.lineTo(x, y);
		}if(edge=="arrow"){
			ctx.quadraticCurveTo(x, yh, x - radius, yhr);
			var multiplier=(width<0)?1:-1;
			ctx.lineTo(x + ((height / 2)*multiplier), y + (height /2)); // right arrow tip
			ctx.lineTo(x - radius, yr);
			ctx.quadraticCurveTo(x, y, xr, y);
		}else{
			ctx.quadraticCurveTo(x, yh, x, yhr);
			ctx.lineTo(x, yr);
			ctx.quadraticCurveTo(x, y, xr, y);
		}
		ctx.closePath();
		if (stroke) {
			ctx.stroke();
		}
		if (fill) {
			ctx.fill();
		}
	};

	/**
	 * Draws a rounded rectangle with an arrowhead on the screen.
	 * @param  {object}  ctx    A valid HTML Canvas Context
	 * @param  {number}  x      Left position of drawing on canvas
	 * @param  {number}  y      Top position of drawing on canvas
	 * @param  {number}  width  Width of rectangle
	 * @param  {number}  height Height of rectangle
	 * @param  {number}  radius Radius of rounding
	 * @param  {Boolean} [fill]   Whether to fill the background
	 * @param  {Boolean} [stroke] Whether to fill the outline
	 * @memberOf  CIQ
	 */
	CIQ.roundRectArrow = function(ctx, x, y, width, height, radius, fill, stroke) {
		CIQ.roundRect(ctx, x, y, width, height, radius, fill, stroke, "arrow");
	};

	/**
	 * Draws a rectangle on the canvas with just the right side curved corners
	 * see {@link CIQ.roundRect}
	 * @memberOf  CIQ
	 */
	CIQ.semiRoundRect=function(ctx, x, y, width, height, radius, fill, stroke) {
		CIQ.roundRect(ctx, x, y, width, height, radius, fill, stroke, "flush");
	};

	/**
	 * Draws a rectangle on the canvas
	 * see {@link CIQ.roundRect}
	 * @memberOf  CIQ
	 */
	CIQ.rect=function(ctx, x, y, width, height, radius, fill, stroke) {
		CIQ.roundRect(ctx, x, y, width, height, 0, fill, stroke);
	};

	/**
	 * No operation will be performed. As a result there will be no label drawn around the value.
	 * see {@link CIQ.roundRect}
	 * @memberOf  CIQ
	 */
	CIQ.noop=function(ctx, x, y, width, height, radius, fill, stroke) {
	};


	/**
	 * Turns a portion of raw text into multi-line text that fits in a given width. This is used for autoformatting of annotations
	 * @param  {object} ctx    A valid HTML Canvas Context
	 * @param  {string} phrase The text
	 * @param  {number} l      The width in pixels to fit the text within on the canvas
	 * @return {array}        An array of individual lines that should fit within the specified width
	 * @memberOf  CIQ
	 */
	CIQ.getLines=function(ctx,phrase,l) {
		var wa=phrase.split(" "), phraseArray=[], lastPhrase="", measure=0;
		var fw=false;
		for (var i=0;i<wa.length;i++) {
			var w=wa[i];
			measure=ctx.measureText(lastPhrase+w).width;
			if (measure<l) {
				if(fw) lastPhrase+=" ";
				fw=true;
				lastPhrase+=w;
			}else {
				phraseArray.push(lastPhrase);
				lastPhrase=w;
			}
			if (i===wa.length-1) {
				phraseArray.push(lastPhrase);
				break;
			}
		}
		return phraseArray;
	};


	/**
	 * Creates a string with a periodicity that is easy to read given a chart
	 * @param  {object} stx A chart object
	 * @return {string}     A periodicity value that can be displayed to an end user
	 * @memberOf  CIQ
	 */
	CIQ.readablePeriodicity=function(stx){
		var displayPeriodicity=stx.layout.periodicity;
		var displayInterval=stx.layout.interval;
		if(!stx.isDailyInterval(displayInterval)){
			if(stx.layout.interval!="minute"){
				displayPeriodicity=stx.layout.interval*stx.layout.periodicity;
			}
			displayInterval="min";
		}
		if(displayPeriodicity%60===0){
			displayPeriodicity/=60;
			displayInterval="hour";
		}
		return displayPeriodicity + " " + stx.translateIf(displayInterval.capitalize());
	};


	/* TOC()************* CHART ELEMENT RENDERING ************** */

	/**
	 * Creates a document node which facilitates translation to other languages, if stx.translationCallback callback function is set.
	 * If there is no translationCallback, a standard text node is returned.
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {string} english The word to translate
	 * @param {string} [language] Optional language. Defaults to CIQ.I18N.language.
	 * @return {Node}	A node in the following form if translationCallback exists:
	 * 					<language original="english">translation</language>
	 * 							If it does not exist, a text node is returned.
	 * @memberof CIQ
	 */
	CIQ.translatableTextNode=function(stx, english, language){
		if(stx.translationCallback) {
			var translation=stx.translationCallback(english);
			var translationNode=document.createElement("translate");
			translationNode.setAttribute("original",english);
			translationNode.innerHTML=stx.translationCallback(english,language);
			return translationNode;
		}else{
			return document.createTextNode(english);
		}
	};

	/**
	 * <span class="animation">Animation Loop</span>
	 * Clears the canvas. Uses the fastest known method except on the legacy Android browser which had many problems!
	 * @param  {object} canvas A valid HTML canvas object
	 * @param  {object} [stx]    A chart object, only necessary for old Android browsers on problematic devices
	 * @memberOf  CIQ
	 */
	CIQ.clearCanvas=function(canvas, stx){
		canvas.isDirty=false;
		var ctx=canvas.context;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if(CIQ.isAndroid && !CIQ.is_chrome){	// Android browser last remaining
												// one to need this clearing method
			if(CIQ.ChartEngine.useOldAndroidClear && stx){
				ctx.fillStyle=stx.containerColor;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			var w=canvas.width;
	    	canvas.width=1;
	    	canvas.width=w;
		}
	};
	
	CIQ.monthLetters=["J","F","M","A","M","J","J","A","S","O","N","D"];
	CIQ.monthAbv=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

	/* Enumerated types for time units */
	CIQ.MILLISECOND=1;
	CIQ.SECOND=1000;
	CIQ.MINUTE=60*CIQ.SECOND;
	CIQ.HOUR=60*CIQ.MINUTE;
	CIQ.DAY=24*CIQ.HOUR;
	CIQ.WEEK=7*CIQ.DAY;
	CIQ.MONTH=31*CIQ.DAY;
	CIQ.YEAR=365*CIQ.DAY;
	CIQ.DECADE=10*CIQ.YEAR;

	/**
	 * Convenience function for creating a displayable month name using CIQ.monthLetters and CIQ.monthAbv.
	 * Please note that those arrays may not be utilized if the library is used in conjuction with Internationalization.
	 * This method is used primarily to create the x-axis of a chart
	 * @param  {number} i              The numerical month (0-11)
	 * @param  {boolean} displayLetters - True if just the first letter should be displayed (such as a tight display)
	 * @param  {object} [stx]            The chart object, only necessary if Internationalization is in use
	 * @return {string}                String representation of the month
	 * @memberOf  CIQ
	 */
	CIQ.monthAsDisplay=function(i, displayLetters,stx){
		if(displayLetters){
			if(stx && stx.monthLetters) return stx.monthLetters[i];
			return CIQ.monthLetters[i];
		}else{
			if(stx && stx.monthAbv) return stx.monthAbv[i];
			return CIQ.monthAbv[i];
		}
	};

	/**
	 * Displays a time in readable form. If Internationalization is in use then the time will be in 24 hour Intl numeric format
	 * @param  {date} dt  JavaScript Date object
	 * @param  {object} [stx] Optional chart object if Internationalization is in use
	 * @param {number} [precision] Optional precision to use. If `null` then `hh:mm`. `CIQ.SECOND` then `hh:mm:ss`. If `CIQ.MILLISECOND` then `hh:mm:ss.mmmmm`
	 * @return {string}     Human friendly time, usually hh:mm
	 * @memberOf  CIQ
	 */
	CIQ.timeAsDisplay=function(dt, stx, precision){
		var internationalizer=stx?stx.internationalizer:null;
		if(internationalizer){
			if(precision==CIQ.SECOND)
				return internationalizer.hourMinuteSecond.format(dt);
			else if(precision==CIQ.MILLISECOND)
				return internationalizer.hourMinuteSecond.format(dt) + "." + dt.getMilliseconds();
			else
				return internationalizer.hourMinute.format(dt);
		}else{
			var min=dt.getMinutes();
			if(min<10) min="0" + min;
			var str=dt.getHours() + ":" + min;
			var sec="";
			if(precision<=CIQ.SECOND){
				sec=dt.getSeconds();
				if(sec<10) sec="0" + sec;
				str+=":" + sec;
			}
			if(precision==CIQ.MILLISECOND){
				var msec=dt.getMilliseconds();
				if(msec<10) msec="00" + msec;
				else if(msec<100) msec="0" + msec;
				str+="." + msec;
			}
			return str;
		}
	};

	/**
	 * Given a numeric price that may be a float with rounding errors, this will trim off the trailing zeroes
	 * @param  {Float} price The price
	 * @return {Float}       The price trimmed of trailing zeroes
	 * @memberOf  CIQ
	 */
	CIQ.fixPrice=function(price){
		if(!price && price!==0) return null;
		var p=price.toFixed(10);
		for(var i=p.length-1;i>1;i--){
			if(p.charAt(i)!="0")
				break;
		}
		p=p.substring(0,i+1);
		return parseFloat(p);
	};

	/**
	 * Condenses an integer into abbreviated form by adding "k","m","b" or "t". This method is used in the y-axis for example with volume studies.
	 * @param  {number} txt - A numerical value
	 * @return {string}     Condensed version of the number
	 * @example
	 * // This will return 12m
	 * condentInt(12000000);
	 * @memberOf  CIQ
	 */
	CIQ.condenseInt=function(txt){
		if(txt===null || typeof txt=="undefined") return "";
		if(txt===Infinity || txt===-Infinity) return "n/a";
		if(txt>0){
			if(txt>1000000000000) txt=Math.round(txt/100000000000)/10 + "t";
			else if(txt>100000000000) txt=Math.round(txt/1000000000) + "b"; //100b
			else if(txt>10000000000) txt=(Math.round(txt/100000000)/10).toFixed(1) + "b"; //10.1b
			else if(txt>1000000000) txt=(Math.round(txt/10000000)/100).toFixed(2) + "b"; //1.11b

			else if(txt>100000000) txt=Math.round(txt/1000000) + "m"; //100m
			else if(txt>10000000) txt=(Math.round(txt/100000)/10).toFixed(1) + "m"; //10.1m
			else if(txt>1000000) txt=(Math.round(txt/10000)/100).toFixed(2) + "m"; //1.11m

			else if(txt>100000) txt=Math.round(txt/1000) + "k"; //100k
			else if(txt>10000) txt=(Math.round(txt/100)/10).toFixed(1) + "k"; //10.1k
			else if(txt>1000) txt=(Math.round(txt/10)/100).toFixed(2) + "k"; //1.11k
			else txt=txt.toFixed(0);
		}else{
			if(txt<-1000000000000) txt=Math.round(txt/100000000000)/10 + "t";
			else if(txt<-1000000000) txt=Math.round(txt/100000000)/10 + "b";
			else if(txt<-1000000) txt=Math.round(txt/100000)/10 + "m";
			else if(txt<-1000) txt=Math.round(txt/100)/10 + "k";
			else txt=txt.toFixed(0);
		}
		return txt;
	};


	/**
	 * Determines how many decimal places the security trades. This is a callback from CIQ.ChartEngine.calculateTradingDecimalPlaces and you
	 * can override this with your own functionality. The default algorithm is to check the most recent 50 quotes and find the maximum number
	 * of decimal places that the stock has traded. This will work for most securities but if yourmarket data feed has rounding errors
	 * or bad data then you may want to supplement this algorithm that checks the maximum value by security type.
	 * @param {Object} params Parameters
	 * @param  {CIQ.ChartEngine} params.stx    The chart object
	 * @param {CIQ.ChartEngine.Chart} params.chart The chart in question
	 * @param  {Object} params.symbol The symbol object. If you create charts with just stock symbol then symbolObject.symbol will contain that symbol
	 * @return {Number}        The number of decimal places
	 * @memberof CIQ
	 */
	CIQ.calculateTradingDecimalPlaces=function(params){
		var chart=params.chart;
		var decimalPlaces=2;
		var quotesToCheck = 50; // Check up to 50 recent quotes
		var masterData=chart.masterData;
		if(masterData && masterData.length > quotesToCheck){
			for(var i=1;i<quotesToCheck;i++){
				var position=masterData.length-i;
				if(position<0) break;
				var quotes=masterData[position];
				if(quotes.Close && typeof quotes.Close == 'number'){
					var cs=quotes.Close.toString();
					var point=cs.indexOf('.');
					if(point!=-1){
						var dp = cs.length-point-1;
						if(dp>decimalPlaces){
							decimalPlaces=dp;
						}
					}
				}
			}
		}
		var maxDecimalPlaces=chart.yAxis.maxDecimalPlaces;
		if(decimalPlaces>maxDecimalPlaces) decimalPlaces=maxDecimalPlaces;
		return decimalPlaces;
	};

	/**
	 * Fills an area on the chart, usually created by a study.
	 * @param  {object} stx    The chart object
	 * @param  {array} points  The set of points, this is an array of chart coordinates in array form
	 * 							e.g. [[x1,y1],[x2,y2]].  The points should be arranged to form a loop;
	 * 							the loop need not be closed.
	 * @param  {string} color  color to fill the area
	 * @param  {number} opacity opacity of fill, 0 to 1.  Defaults to 0.1
	 * @param  {string} [panelName] optional Name of panel to draw on.  If omitted or invalid, area may fill over top or bottom of plot area
	 * @since panelName parameter added 01-20-2015
	 * @memberOf CIQ
	 */
	CIQ.fillArea=function(stx, points, color, opacity, panelName){
		if(!points.length) return;
		var ctx=stx.chart.context;
		ctx.lineWidth=0;
		var globalAlpha=ctx.globalAlpha;
		if(!opacity && opacity!==0) opacity=0.2;
		ctx.globalAlpha=opacity;
		if(color=="auto") color=stx.defaultColor;
		ctx.fillStyle=color;

		var b=Number.MAX_VALUE;
		var t=b*-1;
		var panel=stx.panels[panelName];
		if(panel){
			t=panel.yAxis.top;
			b=panel.yAxis.bottom;
			ctx.save();
			ctx.beginPath();
			ctx.rect(panel.left, t, panel.width, b-t);
			ctx.clip();
		}
		ctx.beginPath();
		ctx.moveTo(points[0][0],points[0][1]);
		for(var i=1;i<points.length;i++){
			ctx.lineTo(points[i][0],points[i][1]);
		}
		ctx.closePath();
		ctx.fill();
		if(panel) ctx.restore();

		ctx.lineWidth=1;
		ctx.globalAlpha=globalAlpha;
	};

	CIQ.prepareChannelFill=function(stx, quotes, parameters){
		//We use the quote cache for our y values since we already plotted the series.
		var panel=stx.panels[parameters.panelName], yAxis=panel.yAxis;
        var t=yAxis.top;
		var noSlopes=parameters.noSlopes;
		var candleWidth=stx.layout.candleWidth;
		var x0=panel.left - (noSlopes?1:0.5)*candleWidth + stx.micropixels - 1;
		var x1=x0;
		var isChart=(panel.name==stx.chart.panel.name);

      	function getLeftmost(band, y){
    		var leftTick=stx.chart.dataSet.length-stx.chart.scroll;
			if(noSlopes || leftTick<=0){
				return [0,y];
			}else if(leftTick>0){
				var baseline=stx.chart.dataSet[leftTick];
				if(isChart && baseline.transform) baseline=baseline.transform;
				var y0=baseline[band];
				y0=yAxis.semiLog?stx.pixelFromPrice(y0,panel):(yAxis.high-y0)*yAxis.multiplier+t;
				if(!isNaN(y0)) return [x0,y0];
			}
			return null;
		}

    	function firstHighOrLow(i, quote, band, arr){
            var y=quote.cache[parameters[band]];
            if(!isNaN(y)){
            	if(i==1) {
            		var l=getLeftmost(parameters[band], y);
            		if(l!==null) arr.push(l);
	            	if(noSlopes) arr.push([x1,l[1]]);
            	}
            	arr.push([x1,y]);
            }
    	}

		var highs=[],lows=[];
	    for(var i=1;i<=quotes.length;i++){
		    var quote_1=quotes[i-1];
			if(!noSlopes && !highs.length && quote_1 && quote_1.candleWidth){
            	candleWidth=(candleWidth+quote_1.candleWidth)/2;
            }
           	x1+=candleWidth;
	    	if(!quote_1 || !quote_1.cache) continue;
            if(quote_1.candleWidth) candleWidth=quote_1.candleWidth/2;
            else candleWidth=stx.layout.candleWidth/2;
			if(i==quotes.length){
				if(noSlopes){
					var offset=x1+2*candleWidth;
            		highs.push([offset,highs[highs.length-1][1]]);
            		lows.push([offset,lows[lows.length-1][1]]);
				}
				break;
			}

            var quote=quotes[i];
        	if(noSlopes) candleWidth+=candleWidth;
        	else if(quote.candleWidth) candleWidth+=quote.candleWidth/2;
            else candleWidth+=stx.layout.candleWidth/2;
			var x2=x1+candleWidth;

        	if(isChart && quote_1.transform) quote_1=quote_1.transform;

	        if(!highs.length) firstHighOrLow(i, quote_1, "topBand", highs);
            if(!lows.length) firstHighOrLow(i, quote_1, "bottomBand", lows);

			if(isChart && quote.transform) quote=quote.transform;
        	if(highs.length){
        		if(noSlopes) highs.push([x2,highs[highs.length-1][1]]);
            	highs.push([x2,quote.cache[parameters.topBand]]);
        	}
        	if(lows.length){
        		if(noSlopes) lows.push([x2,lows[lows.length-1][1]]);
            	lows.push([x2,quote.cache[parameters.bottomBand]]);
        	}
	    }
	    var points=highs.concat(lows.reverse());
	    var opacity=parameters.opacity;
	    CIQ.fillArea(stx, points, parameters.color, opacity, parameters.panelName);
	};

	CIQ.preparePeakValleyFill=function(stx, quotes, parameters){
		//We use the quote cache for our y values since we already plotted the series.
		var panel=stx.panels[parameters.panelName], yAxis=panel.yAxis, chart=stx.chart;
        var t=yAxis.top;
		if(!parameters.threshold && parameters.threshold!==0) return;
		var candleWidth=stx.layout.candleWidth, isChart=(panel.name==chart.panel.name);
		var band=parameters.band, threshold=parameters.threshold, direction=parameters.direction;
		var dataSet=chart.dataSet, leftTick=dataSet.length-chart.scroll;
    	var x1=panel.left - 0.5*candleWidth + stx.micropixels - 1;
		var x0=x1;
		var yThresh;  //where threshold hits yaxis
		if(isChart){
			yThresh=stx.pixelFromPriceTransform(threshold, panel);
		}else{
			yThresh=stx.pixelFromPrice(threshold, panel);
		}

    	var points=[];
	    for(var i=0;i<quotes.length;i++){
	    	if(!i && quotes.length>1) continue;
	    	var quote=quotes[i];
	    	var quote_1=quotes[i-1];
			if(quote_1 && quote_1.candleWidth){
				candleWidth=(candleWidth+quote_1.candleWidth)/2;
			}else{
				candleWidth=(candleWidth+stx.layout.candleWidth)/2;
			}
           	x1+=candleWidth;
	    	if(i && !quote_1) continue;
            if(quote_1 && quote_1.candleWidth) candleWidth=quote_1.candleWidth/2;
            else candleWidth=stx.layout.candleWidth/2;
            if(!i) quote_1=quote;

	    	var y2,y1;
	    	if(quote.cache && quote_1.cache){
		    	y2=quote.cache[band];
		    	y1=quote_1.cache[band];
		    	if(isChart){
					if(quote.transform) y2=stx.pixelFromPrice(quote.transform[band],panel);
					if(quote_1.transform) y1=stx.pixelFromPrice(quote_1.transform[band],panel);
				}
			}
	    	if(typeof y2=="undefined" || typeof y1=="undefined"){
	    		y2=stx.pixelFromPrice(quote[band], panel);
	    		y1=stx.pixelFromPrice(quote_1[band],panel);
	    	}
	        if(!points.length){
            	if(i<=1){
					if(leftTick>0){
						var baseline=dataSet[leftTick];
						if(isChart && baseline.transform) baseline=baseline.transform;
						var y0=baseline[band];
						y0=yAxis.semiLog?stx.pixelFromPrice(y0,panel):(yAxis.high-y0)*yAxis.multiplier+t;
			            if(!isNaN(y0)){
			            	if(y0>=yThresh && y1>=yThresh){
				            	points.push([x0, direction==1?yThresh:y0]);
			            	}else if(y0<=yThresh && y1<=yThresh){
					            points.push([x0, direction==-1?yThresh:y0]);
			            	}else{
			            		points.push([x1-(x1-x0)*(yThresh-y1)/(y0-y1),yThresh]);
			            	}
			            }
					}
				}

	            if(y1 && !isNaN(y1)){
	            	if((quote_1[band]>=threshold && direction==1) || (quote_1[band]<=threshold && direction==-1)){
	            		points.push([x1,y1]);
	            	}else{
	            		points.push([x1,yThresh]);
	            	}
	            }
	        }

            if(quote.candleWidth) candleWidth+=quote.candleWidth/2;
            else candleWidth+=stx.layout.candleWidth/2;
        	if(i && points.length){
        		var lastPoint=points[points.length-1];
            	var x2=x1+candleWidth;
            	if(stx.extendLastTick && i==quotes.length-1) x2+=candleWidth/2;
	           	var newPoint=[lastPoint[0]+(x2-lastPoint[0])*(yThresh-y1)/(y2-y1),yThresh];
	           	if((quote[band]>threshold && direction==1) || (quote[band]<threshold && direction==-1)){
	           		if(lastPoint[1]==yThresh) points.push(newPoint);
	           		points.push([x2,y2]);
	           	}else{
	           		if(lastPoint[1]!=yThresh) points.push(newPoint);
	            	points.push([x2,yThresh]);
	            }
            }
	    }
	    var length=points.length;
	    if(!length) return;
	    if(parameters.edgeHighlight){
	    	var edgeParameters=parameters.edgeParameters, lineWidth=edgeParameters.lineWidth;
	    	if(lineWidth>100) lineWidth=1; // trap case where no width is specified in the css
	    	for(var p=0;p<length-1;p++){
	    		var point0=points[p], point1=points[p+1];
	    		if(point0[1]!=yThresh || point1[1]!=yThresh)
	    			stx.plotLine(point0[0], point1[0], point0[1], point1[1], parameters.edgeHighlight,"segment", chart.context, true, edgeParameters);
	    	}
	    }
	    points.push([points[length-1][0],yThresh],[points[0][0],yThresh]);
	    var opacity=parameters.opacity;
	    if(!opacity && opacity!==0) opacity=0.3;
	    CIQ.fillArea(stx, points, parameters.color, opacity, parameters.panelName);
	};
	
	CIQ.fillIntersecting=function(stx, sd, quotes, parameters){
	    var intersections = [];
	    var panel=stx.panels[sd.panel];
	    if(!parameters.topAxis) parameters.topAxis=panel.yAxis;
	    if(!parameters.bottomAxis) parameters.bottomAxis=panel.yAxis;
	    var topBand=parameters.topBand, bottomBand=parameters.bottomBand;
	    var topAxis=parameters.topAxis, bottomAxis=parameters.bottomAxis;
	    var ctx=stx.chart.context;
		var topColor=sd.outputs[sd.outputMap[topBand]];
		var bottomColor=sd.outputs[sd.outputMap[bottomBand]];
		var left=stx.chart.left;

	    var i,ax1,ax2,bx1,bx2,ay1,ay2,by1,by2,interX,interY;
		stx.startClip(sd.panel);
		var copyQuotes=[];
	    for(i=0;i<quotes.length;i++){ //creates array of local quote values
	    	if(!quotes[i]){
	    		copyQuotes.push(null);
	    	}else{
		    	copyQuotes.push(quotes[i].transform?quotes[i].transform:quotes[i]);
		    }
	    }
	    for(i=0;i<copyQuotes.length-1;i++){ //creates array of intersection points
	    	var q0=copyQuotes[i], q1=copyQuotes[i+1];
	    	if(!q0 || !q1) continue;
			if(panel.name==stx.chart.name){
				if(q0.transform) q0=q0.transform;
				if(q1.transform) q1=q1.transform;
	        }
	        if(q0[topBand]===null || isNaN(q0[topBand])) continue;
	        else if((q0[topBand]>=q0[bottomBand] && q1[topBand]<=q1[bottomBand]) || (q0[topBand]<=q0[bottomBand] && q1[topBand]>=q1[bottomBand])){
	            bx1=ax1=stx.pixelFromBar(i);
	            bx2=ax2=stx.pixelFromBar(i+1);
	            ay1=stx.pixelFromPrice(q0[topBand], panel, topAxis);
	            ay2=stx.pixelFromPrice(q1[topBand], panel, topAxis);
	            by1=stx.pixelFromPrice(q0[bottomBand], panel, bottomAxis);
	            by2=stx.pixelFromPrice(q1[bottomBand], panel, bottomAxis);

	            interX=CIQ.intersectLineLineX(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2);
	            interY=CIQ.intersectLineLineY(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2);
	            var intersection={};
	            intersection.x=interX;
	            intersection.y=interY;
	            intersection.tick=i+1;
	            intersections.push(intersection);
	        }
	    }

	    var futureIntersections = [];
	    for(i=0;parameters.fillFuture && sd.futureA && i<sd.futureA.length-1;i++){ //creates array of future intersection points so clouds project into the future
	        if(sd.futureA[i]===null || isNaN(sd.futureA[i]));
	        else if((sd.futureA[i]>sd.futureB[i] && sd.futureA[i+1]<sd.futureB[i+1]) || (sd.futureA[i]<sd.futureB[i] && sd.futureA[i+1]>sd.futureB[i+1])){
	            bx1=ax1=stx.pixelFromBar(copyQuotes.length+i);
	            bx2=ax2=stx.pixelFromBar(copyQuotes.length+i+1);
	            ay1=stx.pixelFromPrice(sd.futureA[i], panel, topAxis);
	            ay2=stx.pixelFromPrice(sd.futureA[i+1], panel, topAxis);
	            by1=stx.pixelFromPrice(sd.futureB[i], panel, bottomAxis);
	            by2=stx.pixelFromPrice(sd.futureB[i+1], panel, bottomAxis);

	            interX=CIQ.intersectLineLineX(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2);
	            interY=CIQ.intersectLineLineY(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2);
	            var fIntersection={};
	            fIntersection.x=interX;
	            fIntersection.y=interY;
	            fIntersection.tick=copyQuotes.length+i+1;
	            futureIntersections.push(fIntersection);
	        }
	    }
	    var k,m,n;
        ctx.beginPath();
    	//first cloud, which is open on the left of the chart, possibly on the right as well
    	var start=0;
    	var end=copyQuotes.length;
    	if(intersections.length) end=intersections[0].tick;
    	while(start<=end && !copyQuotes[start]) start++;
    	var copyStart=copyQuotes[start], startTopBand=copyStart[topBand], startBottomBand=copyStart[bottomBand];
    	if(start<=end){
	        if(startTopBand>startBottomBand){
	            ctx.fillStyle=topColor;
	        }else{
	            ctx.fillStyle=bottomColor;
	        }
		    ctx.moveTo(left,stx.pixelFromPrice(startTopBand, panel, topAxis));
            for(n = start;n<end;n++){
                ctx.lineTo(stx.pixelFromBar(n),stx.pixelFromPrice(copyQuotes[n][topBand], panel, topAxis));
            }
            if(intersections[0]){
            	ctx.lineTo(intersections[0].x,intersections[0].y);
            }
            for(m = end-1;m>=start;m--){
                ctx.lineTo(stx.pixelFromBar(m),stx.pixelFromPrice(copyQuotes[m][bottomBand], panel, bottomAxis));
            }
            ctx.lineTo(left,stx.pixelFromPrice(startBottomBand, panel, bottomAxis));
            ctx.lineTo(left,stx.pixelFromPrice(startTopBand, panel, topAxis));
	        ctx.fill();
        }
	    for(k = 0;k<intersections.length;k++){
	        ctx.beginPath();
	        ctx.moveTo(intersections[k].x,intersections[k].y);
	        if(copyQuotes[intersections[k].tick][topBand]>copyQuotes[intersections[k].tick][bottomBand]){
	            ctx.fillStyle=topColor;
	        }else{
	            ctx.fillStyle=bottomColor;
	        }
	        if(k+1==intersections.length){ //last cloud in the present
	            for(n = intersections[k].tick;n<copyQuotes.length;n++){
	                ctx.lineTo(stx.pixelFromBar(n),stx.pixelFromPrice(copyQuotes[n][topBand], panel, topAxis));
	            }
	            for(m = copyQuotes.length-1;m>=intersections[k].tick;m--){
	                ctx.lineTo(stx.pixelFromBar(m),stx.pixelFromPrice(copyQuotes[m][bottomBand], panel, bottomAxis));
	            }
	        }else{ //draw past clouds
	            for(n = intersections[k].tick;n<intersections[k+1].tick;n++){
	                ctx.lineTo(stx.pixelFromBar(n),stx.pixelFromPrice(copyQuotes[n][topBand], panel, topAxis));
	            }
	            ctx.lineTo(intersections[k+1].x,intersections[k+1].y);
	            for(m = intersections[k+1].tick-1;m>=intersections[k].tick;m--){
	                ctx.lineTo(stx.pixelFromBar(m),stx.pixelFromPrice(copyQuotes[m][bottomBand], panel, bottomAxis));
	            }
	        }
	        ctx.fill();
	    }

	    if(parameters.fillFuture){
	    	stx.chart.context.beginPath();
		    if(k>=0 && copyQuotes[copyQuotes.length-1]){
		        ctx.moveTo(stx.pixelFromBar(copyQuotes.length-1),stx.pixelFromPrice(copyQuotes[copyQuotes.length-1][parameters.topBand], panel, parameters.topAxis));
		        var ql;
		        if(!futureIntersections.length){ //no future intersections, just continue present cloud
		            ql=copyQuotes.length;
		            for(n = 0;n<sd.futureA.length;n++){
		                ctx.lineTo(stx.pixelFromBar(ql),stx.pixelFromPrice(sd.futureA[n], panel, parameters.topAxis));
		                ql++;
		            }
		            ql--;
		            for(n = sd.futureB.length-1;n>=0;n--){
		                ctx.lineTo(stx.pixelFromBar(ql),stx.pixelFromPrice(sd.futureB[n], panel, parameters.bottomAxis));
		                ql--;
		            }
		            ctx.lineTo(stx.pixelFromBar(copyQuotes.length-1),stx.pixelFromPrice(copyQuotes[copyQuotes.length-1][parameters.bottomBand], panel, parameters.bottomAxis));
		            ctx.fill();
		        }else{ //finish present cloud so we can start on the future clouds
		            ql=copyQuotes.length;

		            for(n = 0;n<futureIntersections[0].tick-copyQuotes.length;n++){
		                ctx.lineTo(stx.pixelFromBar(ql),stx.pixelFromPrice(sd.futureA[n], panel, parameters.topAxis));
		                ql++;
		            }
		            ql--;
		            ctx.lineTo(futureIntersections[0].x,futureIntersections[0].y);
		            for(n = futureIntersections[0].tick-1-copyQuotes.length;n>=0;n--){
		                ctx.lineTo(stx.pixelFromBar(ql),stx.pixelFromPrice(sd.futureB[n], panel, parameters.bottomAxis));
		                ql--;
		            }
		            ctx.lineTo(stx.pixelFromBar(copyQuotes.length-1),stx.pixelFromPrice(copyQuotes[copyQuotes.length-1][parameters.bottomBand], panel, parameters.bottomAxis));
		            ctx.fill();
		        }
		    }

		    for(k = 0;k<futureIntersections.length;k++){
		        ctx.beginPath();
		        ctx.moveTo(futureIntersections[k].x,futureIntersections[k].y);
		        if(sd.futureA[futureIntersections[k].tick-copyQuotes.length]>sd.futureB[futureIntersections[k].tick-copyQuotes.length]){
		            ctx.fillStyle=sd.outputs[sd.outputMap[parameters.topBand]];
		        }else{
		            ctx.fillStyle=sd.outputs[sd.outputMap[parameters.bottomBand]];
		        }
		        if(k+2>futureIntersections.length){ //last cloud
		            for(n = futureIntersections[k].tick;n<sd.futureA.length+copyQuotes.length;n++){
		                ctx.lineTo(stx.pixelFromBar(n),stx.pixelFromPrice(sd.futureA[n-copyQuotes.length], panel, parameters.topAxis));
		            }
		            for(m = sd.futureA.length-1;m>=futureIntersections[k].tick-copyQuotes.length;m--){
		                ctx.lineTo(stx.pixelFromBar(m+copyQuotes.length),stx.pixelFromPrice(sd.futureB[m], panel, parameters.bottomAxis));
		            }
		        }else{ //draw future clouds
		            for(n = futureIntersections[k].tick;n<futureIntersections[k+1].tick;n++){
		                ctx.lineTo(stx.pixelFromBar(n),stx.pixelFromPrice(sd.futureA[n-copyQuotes.length], panel, parameters.topAxis));
		            }
		            ctx.lineTo(futureIntersections[k+1].x,futureIntersections[k+1].y);
		            for(m = futureIntersections[k+1].tick-1;m>=futureIntersections[k].tick;m--){
		                ctx.lineTo(stx.pixelFromBar(m),stx.pixelFromPrice(sd.futureB[m-copyQuotes.length], panel, parameters.bottomAxis));
		            }
		        }
		        ctx.fill();
		    }
	    }
	    stx.endClip();
	};

	/**
	 * Draws an item in the legend and returns the position for the next item
	 * @param {CIQ.ChartEngine} stx The chart object
	 * @param  {array} xy    An X,Y tuple (from chart.legend)
	 * @param  {string} label The text to print in the item
	 * @param  {string} color The color for the background of the item
	 * @return {array}       A tuple containing the X,Y position for the next the item
	 * @memberOf CIQ
	 */
	CIQ.drawLegendItem=function(stx, xy, label, color, opacity){
		if(!opacity) opacity=1;
		var x=xy[0], y=xy[1], w=10, h=10;
		var context=stx.chart.context;
		context.globalAlpha=opacity;
		context.fillStyle=color;
		context.fillRect(x, y, w, h);
		context.globalAlpha=1;
		x+=w+2;	// 2 px spacing between box and text
		context.fillStyle=stx.defaultColor;
		context.fillText(label, x, y);
		x+=context.measureText(label).width + 6; // 6 px spacing between labels
		return [x, y];
	};


	/**
	 * Draws a legend for the series that are displayed on the chart.
	 * @param {CIQ.ChartEngine} stx The chart object to draw
	 * @param  {object} params parameters for drawing the legend
	 * @param  {CIQ.ChartEngine.Chart} [params.chart] The chart object
	 * @param  {object} [params.legendColorMap] A map of series names to colors and display symbols ( example  IBM:{color:'red', display:'Int B M'} )
	 * @param  {object} [params.coordinates] Coordinates upon which to draw the items, in pixels relative to top left of panel ( example  {x:50, y:0} ).  If null, uses chart.legend
	 * @param  {boolean} [params.noBase] Set to true to not draw the base (the chart symbol's color) in the legend
	 * @memberOf CIQ
	 */
	CIQ.drawLegend=function(stx, params){
		var coordinates=params.coordinates;
		var context=stx.chart.context;
		context.textBaseline="top";
		var rememberFont=context.font;
		stx.canvasFont("stx-legend",context);

		if(!coordinates) coordinates=params.chart.legend;
		var xy=[coordinates.x, coordinates.y];
		var lineColor=stx.defaultColor;

		var chartType=stx.layout.chartType;
		if(stx.chart.customChart && stx.chart.customChart.chartType){
			chartType=stx.chart.customChart.chartType;
		}

		if(!params.noBase){
			// baseLegendColors will contain the colors used in the chart itself. For instance the color of the line
			// chart, or red,green for a candle. We'll print a little rainbow as such.
			var c;
			if(stx.chart.baseLegendColors instanceof Array){
				var colors=stx.chart.baseLegendColors;
				if(colors.length>1){
					var grd=context.createLinearGradient(xy[0],xy[1],xy[0]+10,xy[1]);
					for(c=0;c<colors.length;c++){
						grd.addColorStop(c/(colors.length-1),colors[c]);
					}
					lineColor=grd;
				}else if(colors.length>0){
					lineColor=colors[0];
				}else{
					lineColor=stx.getCanvasColor("stx_line_chart");
				}
			}else if(chartType=="mountain"){
				c=stx.canvasStyle("stx_mountain_chart");
				var strokeStyle=c.borderTopColor;
				if(strokeStyle && strokeStyle!="transparent")
					lineColor=strokeStyle;
			}else{
				lineColor=null;
			}
			if(lineColor) {
				if(params.chart.symbolDisplay){
					symbol = params.chart.symbolDisplay;
				}else{
					symbol=params.chart.symbol;
				}
				xy=CIQ.drawLegendItem(stx, xy, symbol, lineColor);
			}
		}
		for(var field in params.legendColorMap){
			var display = field;
			if (params.legendColorMap[field].display) display = params.legendColorMap[field].display;
			xy=CIQ.drawLegendItem(stx, xy, display, params.legendColorMap[field].color, params.legendColorMap[field].opacity);
		}
		context.font=rememberFont;
	};


	/**
	 * This method will return an tuple [min,max] that contains the minimum
	 * and maximum values in the series where values are series[field]
	 * @param {Array} series The series
	 * @param {string} field The name of the field to look at
	 * @return {Array} Tuple containing min and max values in the series
	 * @memberOf  CIQ
	 */
	CIQ.minMax=function(series, field){
	    var min=Number.MAX_VALUE;
	    var max=Number.MAX_VALUE*-1;
	    for(var i=0;i<series.length;i++){
	    	var entry=series[i];
	    	if(!entry) continue;
	        var val=entry[field];
	        if(!val && val!==0) continue;
	        if(isNaN(val)) continue;
	        min=Math.min(min, val);
	        max=Math.max(max, val);
	    }
	    return [min,max];
	};

	/**
	 * Convenience function to destruct a chart window and related GUI ({@link CIQ.ThemeManager}, {@link CIQ.MenuManager}), eliminating all references and dependencies, and optionally its containing DOM element.
	 * <BR> Please note that this call will destroy the menu manager and theme manager even if multiple charts are registered to them, in which case you must manually call the destroy() method for the remaining charts.
	 * @param {CIQ.ChartEngine} stx The chart object to destroy
	 * @param {string} excludedSelector If passed then any top level object within chartContainer which matches this selector will not be deleted (and neither will the wrapper)
	 * @since 07/01/2015
	 * @memberOf CIQ
	 */
	CIQ.destroy=function(stx, excludedSelector){
		var registeredContainers=CIQ.ChartEngine.registeredContainers;
	    for(var rc=0;rc<registeredContainers.length;rc++){
	    	if(registeredContainers[rc]==stx.chart.container){
	    		registeredContainers.splice(rc,1);
	    		break;
	    	}
	    }
	    
	    // to do:
	    // remove all stx stored in CIQ.MenuManager.registeredCharts insted and and remove the stx argument so the signature is CIQ.destroy=function(excludedSelector)
	    stx.styles={};
	    stx.destroy();
	    stx=null;
	    CIQ.ThemeManager.destroy();
	    if(CIQ.MenuManager) CIQ.MenuManager.destroy();
	    if(excludedSelector){
	    	var childNodes=$$$(".stx-wrapper").childNodes;
	    	var matches=$$$(".stx-wrapper").querySelectorAll(excludedSelector);
	    	for(var m=0;m<matches.length;m++) {
	    		if(matches[m].parentNode==$$$(".stx-wrapper")) CIQ.appendClassName(matches[m],"stx-passover");
	    	}
	    	for(var c=childNodes.length-1;c>=0;c--){
	    		if(CIQ.hasClassName(childNodes[c],"stx-passover")) CIQ.unappendClassName(childNodes[c],"stx-passover");
	    		else childNodes[c].parentNode.removeChild(childNodes[c]);
	    	}
	    }else{
		    $$$(".stx-wrapper").parentNode.removeChild($$$(".stx-wrapper"));
	    }
	};

	/**
	 * Convenience function to iterate through the charts masterData and add a data member. Generally used for additional comparison or study symbols.
	 * Can be used with any array of data objects which contains at least the 'DT' (date in javascript format) and 'Close' ( close/last price ) elements of an [OHLC object](index.html#data-format).
	 * The data member will be the string defined by "label".
	 * Dates must be exact matches (minutes, hours, seconds, milliseconds) in order to show up in comparisons.
	 * @param  {CIQ.ChartEngine} stx        	A chart object
	 * @param  {String} [label]     	The new member name to add to masterData. masterData[label]=data["Close"]. Required unless "fields" is specified.
	 * @param  {Array} data 			The data to add (which should align or closely align with the chart data by date)
	 * @param {Array} [fields] 			The fields from the data objects to extract (as opposed to "Close") and add to the new label member. One label member will be added per field. Takes precedence over `createObject` flag.
	 * @param {Boolean} [createObject] 	If true, then data elements from the data array are added as *objects* assigned to the label. Example: member[label]=data[element]; This behavior is mutually exclusive with `fields`.
	 * @param {String} [fieldForLabel] 	If set, this will be the field from data copied into label, if not set, Close is used; This behavior is mutually exclusive with `fields`.
	 * @memberOf CIQ
	 * @since 04-2015
	 * @example
	 * //data element format if neither fields nor createObject are used
	 * {DT:epoch,Date:strDate,Close:value}
	 * //data element format if fields is used
	 * {DT:epoch,Date:strDate,Field1:value,Field2:value,Field3:value,Field4:value}
	 * //data element format if createObject is used
	 * {DT:epoch,Date:strDate,AnyOtherData:otherData,MoreData:otherData,...}
	 * @since 15-07-01 fieldForLabel argument
	 */
	CIQ.addMemberToMasterdata=function(stx, label, data, fields, createObject, fieldForLabel){
		// Match up the data and store the data point
		if (!data) return;
		var mIterator=0,cIterator=0;
		while(mIterator<stx.masterData.length && cIterator<data.length){
			var c=data[cIterator];
			var m=stx.masterData[mIterator];
			if(!c.DT) c.DT=CIQ.strToDateTime(c.Date);
			if(c.DT.getTime()==m.DT.getTime()){
				if(fields){
					for(var i=0;i<fields.length;i++){
						m[fields[i]]=c[fields[i]];
					}
				}else if(createObject){
					m[label]=c;
				}else if(fieldForLabel){
					m[label]=c[fieldForLabel];
				}else if (stx.layout.adj && typeof c.Adj_Close!="undefined") {
					m[label]=c.Adj_Close;
				}else{
					m[label]=c.Close;
				}
				cIterator++;
				mIterator++;
				continue;
			}
			if(c.DT<m.DT) cIterator++;
			else mIterator++;
		}
	};

	/* TOC()************* THEME HELPER ************** */

	/**
	 * Generates an object that can be used to create a theme dialog. The initial
	 * values contain the existing values in the current chart.
	 * Simply have your dialog modify these values and then call the method update();
	 *
	 * Note that the chart has many granular customizations beyond what this theme
	 * helper produces. These can be manipulated in the CSS. This helper simplifies
	 * and consolidates into a manageable dialog.
	 * 
	 * @param {Object} params Parameters
	 * @param {CIQ.CIQ.ChartEngine} params.stx A chart object
	 * @example
	 * var helper=new CIQ.ThemeHelper({stx:stx});
	 * console.log(helper.settings);
	 * helper.settings.chart["Grid Lines"].color="rgba(255,0,0,.5)";
	 * helper.update();
	 */
	CIQ.ThemeHelper=function(params){
		this.params=params;
		var stx=params.stx;
		var backgroundColor="#FFFFFF";
		if(stx.chart.container){
			backgroundColor=getComputedStyle(stx.chart.container).backgroundColor;
			if(CIQ.isTransparent(backgroundColor)) backgroundColor=stx.containerColor;
		}
		this.settings.chart.Background.color=CIQ.hexToRgba(backgroundColor);
		this.settings.chart["Grid Lines"].color=CIQ.hexToRgba(stx.canvasStyle("stx_grid").color);
		this.settings.chart["Grid Dividers"].color=CIQ.hexToRgba(stx.canvasStyle("stx_grid_dark").color);
		this.settings.chart["Axis Text"].color=CIQ.hexToRgba(stx.canvasStyle("stx_xaxis").color);

		this.settings.chartTypes["Candle/Bar"].up.color=CIQ.hexToRgba(stx.canvasStyle("stx_candle_up").color);
		
		this.settings.chartTypes["Candle/Bar"].down.color=CIQ.hexToRgba(stx.canvasStyle("stx_candle_down").color);
		this.settings.chartTypes["Candle/Bar"].up.wick=CIQ.hexToRgba(stx.canvasStyle("stx_candle_shadow_up").color);
		this.settings.chartTypes["Candle/Bar"].down.wick=CIQ.hexToRgba(stx.canvasStyle("stx_candle_shadow_down").color);
		this.settings.chartTypes["Candle/Bar"].up.border=CIQ.hexToRgba(stx.canvasStyle("stx_candle_up").borderLeftColor);
		this.settings.chartTypes["Candle/Bar"].down.border=CIQ.hexToRgba(stx.canvasStyle("stx_candle_down").borderLeftColor);
		if(CIQ.isTransparent(stx.canvasStyle("stx_candle_up").borderLeftColor)) this.settings.chartTypes["Candle/Bar"].up.border=null;
		if(CIQ.isTransparent(stx.canvasStyle("stx_candle_down").borderLeftColor)) this.settings.chartTypes["Candle/Bar"].down.border=null;

		this.settings.chartTypes.Line.color=CIQ.hexToRgba(stx.canvasStyle("stx_line_chart").color);

		this.settings.chartTypes.Mountain.color=CIQ.hexToRgba(stx.canvasStyle("stx_mountain_chart").backgroundColor);
	};

	CIQ.ThemeHelper.prototype.settings={
		"chart":{
			"Background":{
				"color":null
			},
			"Grid Lines":{
				"color":null
			},
			"Grid Dividers":{
				"color":null
			},
			"Axis Text":{
				"color":null
			}
		},
		"chartTypes":{
			"Candle/Bar":{
				"up":{
					"color":null,
					"wick":null,
					"border":null
				},
				"down":{
					"color":null,
					"wick":null,
					"border":null
				}
			},
			"Line":{
				"color":null
			},
			"Mountain":{
				"color":null
			}
		}
	};

	/**
	 * Update the current theme
	 */
	CIQ.ThemeHelper.prototype.update=function(){
		var stx=this.params.stx;
		var classMapping={
			stx_candle_up: {stx_candle_up:true, stx_bar_up:true, stx_hollow_candle_up:true, stx_line_up:true, stx_baseline_up:true},
			stx_candle_down: {stx_candle_down:true, stx_bar_down:true, stx_hollow_candle_down:true ,stx_line_down:true, stx_baseline_down:true},
			stx_shadow_up: {stx_candle_shadow_up:true},
			stx_shadow_down: {stx_candle_shadow_down:true},
			stx_line_chart: {stx_bar_chart:true, stx_line_chart:true},
			stx_grid: {stx_grid:true, stx_grid_border: true},
			stx_grid_dark: {stx_grid_dark:true},
			stx_xaxis: {stx_xaxis_dark:true, stx_xaxis:true, stx_yaxis:true, stx_yaxis_dark:true},
			stx_mountain_chart: {stx_mountain_chart:true},
			stx_market_session: {stx_market_session:true}
		};

		stx.chart.container.style.backgroundColor=this.settings.chart.Background.color;

		function setStyle(style, field, value){
			var styles=classMapping[style];
			for(var s in styles){
				stx.setStyle(s, field, value);
			}
		}
		setStyle("stx_grid","color", this.settings.chart["Grid Lines"].color);
		setStyle("stx_grid_dark","color", this.settings.chart["Grid Dividers"].color);
		setStyle("stx_xaxis","color",this.settings.chart["Axis Text"].color);

		setStyle("stx_candle_up","color",this.settings.chartTypes["Candle/Bar"].up.color);
		setStyle("stx_candle_down","color",this.settings.chartTypes["Candle/Bar"].down.color);
		setStyle("stx_shadow_up","color",this.settings.chartTypes["Candle/Bar"].up.wick);
		setStyle("stx_shadow_down","color",this.settings.chartTypes["Candle/Bar"].down.wick);

		// Only apply borders to candle, not the other types
		stx.setStyle("stx_candle_up", "borderLeftColor", this.settings.chartTypes["Candle/Bar"].up.border);
		stx.setStyle("stx_candle_down", "borderLeftColor", this.settings.chartTypes["Candle/Bar"].down.border);

		setStyle("stx_line_chart","color",this.settings.chartTypes.Line.color);

		stx.setStyle("stx_mountain_chart","borderTopColor",this.settings.chartTypes.Mountain.color);
		stx.setStyle("stx_mountain_chart","backgroundColor",CIQ.hexToRgba(this.settings.chartTypes.Mountain.color,0.8));
		stx.setStyle("stx_mountain_chart","color",CIQ.hexToRgba(this.settings.chartTypes.Mountain.color,0.1));
		stx.draw();
	};




	/* TOC()************* NAME VALUE STORE ************** */

	/**
	 * Base class for interacting with a name value store. This base class saves to local storage
	 * but you can override your own for remote storage.
	 */
	CIQ.NameValueStore=function(){
	};

	CIQ.NameValueStore.prototype.toJSONIfNecessary=function(obj){
		if(obj.constructor==String) return obj;
		try{
			var s=JSON.stringify(obj);
			return s;
		}catch(e){
			console.log("Cannot convert to JSON: " + obj);
			return null;
		}
	};

	CIQ.NameValueStore.prototype.fromJSONIfNecessary=function(obj){
		try{
			var s=JSON.parse(obj);
			return s;
		}catch(e){
			return obj;
		}
	};

	/**
	 * Get a value from the name value store
	 * @param  {String}   field The field to fetch
	 * @param  {Function} cb    Callback. First field is error or null. Second field is the result.
	 * @example
	 * nameValueStore.get("myfield", function(err,data){
	 *    if(!err){
	 *        // do something with data
	 *    }
	 * });
	 */
	CIQ.NameValueStore.prototype.get=function(field, cb){
		var value=CIQ.localStorage.getItem(field);
		cb(null, this.fromJSONIfNecessary(value));
	};

	CIQ.NameValueStore.prototype.set=function(field, value, cb){
		CIQ.localStorage.setItem(field, this.toJSONIfNecessary(value));
		if(cb) cb(null);
	};

	CIQ.NameValueStore.prototype.remove=function(field, cb){
		CIQ.localStorage.removeItem(field);
		if(cb) cb(null);
	};

	/* TOC()************* PLOTTER ************** */

	/**
	 * The Plotter is a device for managing complex drawing operations on the canvas. The HTML 5 canvas performs better when drawing
	 * operations of the same color are batched (reducing the number of calls to the GPU). The plotter allows a developer to store those
	 * operations in a normal control flow, and then have the Plotter deliver the primitives to the canvas. The plotter can also be used
	 * as a caching mechanism for performing the same operations repeatedly. The y-axis of the chart uses this mechanism to boost performance.
	 * @constructor
	 * @name  CIQ.Plotter
	 */
	CIQ.Plotter=function(){
		this.seriesArray=[];
		this.seriesMap={};
	};

	CIQ.Plotter.prototype={
		/**
		 * Define a series to plot. A series is a specific color and referenced by name
		 * @param {string} name         Name of series
		 * @param {boolean} strokeOrFill If true then a stroke operation, otherwise a fill operation
		 * @param {string} color        A valid canvas color
		 * @param {number} [opacity=1]      A valid opacity from 0-1
		 * @param {number} [width=1]      A valid lineWidth from 1
		 * @memberOf  CIQ.Plotter
		 */
			Series: function(name, strokeOrFill, color, opacity, width){
				this.name=name;
				this.strokeOrFill=strokeOrFill;
				this.color=color;
				this.opacity=opacity;
				this.width=width;
				this.moves=[];
				this.text=[];
				if(!opacity || opacity>1 || opacity<0) this.opacity=1;
				if(!width || width>25 || width<1) this.width=1;
			},
			/**
			 * Create a series. This supports either a text color or CIQ.ChartEngine.Style object
			 * @see  CIQ.Plotter.Series
			 * @memberOf  CIQ.Plotter
			 */
			newSeries: function(name, strokeOrFill, colorOrStyle, opacity, width){
				var series;
				if(colorOrStyle.constructor == String) series=new this.Series(name, strokeOrFill, colorOrStyle, opacity, width);
				else series=new this.Series(name, strokeOrFill, colorOrStyle.color, colorOrStyle.opacity, width);
				this.seriesArray.push(series);
				this.seriesMap[name]=series;
			},
			/**
			 * @memberOf  CIQ.Plotter
			 */
			moveTo: function(name, x, y){
				var series=this.seriesMap[name];
				series.moves.push({"action":"moveTo","x":x,"y":y});
			},
			/**
			 * @memberOf  CIQ.Plotter
			 */
			lineTo: function(name, x, y){
				var series=this.seriesMap[name];
				series.moves.push({"action":"lineTo","x":x,"y":y});
			},
			/**
			 * @memberOf  CIQ.Plotter
			 */
			dashedLineTo: function(name, x, y, pattern){
				var series=this.seriesMap[name];
				series.moves.push({"action":"dashedLineTo","x":x,"y":y, "pattern":pattern});
			},
			/**
			 * @memberOf  CIQ.Plotter
			 */
			quadraticCurveTo: function(name, x0, y0, x1, y1){
				var series=this.seriesMap[name];
				series.moves.push({"action":"quadraticCurveTo","x0":x0, "y0":y0, "x":x1, "y":y1});
			},
			/**
			 * Add text to be rendered with the drawing. Primarily used when the Plotter is used for caching since there is no
			 * performance benefit from batching text operations to the GPU. If specifying a bounding box, textBaseline="middle" is assumed
			 * @param {string} name Name of series
			 * @param {string} text The raw text to render
			 * @param {number} x    X position on canvas for text
			 * @param {number} y    Y position on canvas for text
			 * @param {string} [backgroundColor] Optional, will put a box underneath the text
			 * @param {number} [width] Optional width of bounding box
			 * @param {number} [height] Optional height of bounding box
			 * @memberOf  CIQ.Plotter
			 */
			addText: function(name, text, x, y, backgroundColor, width, height){
				var series=this.seriesMap[name];
				series.text.push({"text":text,"x":x,"y":y, "bg":backgroundColor});
			},
			/**
			 * Renders the text objects. This is done after drawing primitives for each series.
			 * @private
			 * @memberOf  CIQ.Plotter
			 */
			drawText: function(context, series){
				for(var i=0;i<series.text.length;i++){
					var textObj=series.text[i];
					if(textObj.bg){
						var w=textObj.width?textObj.width:context.measureText(textObj.text).width;
						var h=textObj.height?textObj.height:12;
						var prev=context.fillStyle;
						context.fillStyle=textObj.bg;
						if(context.textAlign=="right"){
							context.fillRect(textObj.x, textObj.y+(h/2), -w, -h);
						}else{
							context.fillRect(textObj.x, textObj.y+(h/2), w, h);
						}
						context.fillStyle=prev;
					}
					context.fillText(textObj.text, textObj.x, textObj.y);
				}
			},
			/**
			 * Render the plotter. All of the stored operations are sent to the canvas. This operation stores and restores
			 * global canvas parameters such as fillStyle, strokeStyle and globalAlpha.
			 * @param  {object} context A valid HTML canvas context
			 * @param  {string} [name]    Optionally render only a specific series. If null or not provided then all series will be rendered.
			 * @memberOf  CIQ.Plotter
			 */
			draw: function(context, name){
				var prevWidth=context.lineWidth;
				var prevFillStyle=context.fillStyle;
				var prevStrokeStyle=context.strokeStyle;
				var prevGlobalAlpha=context.globalAlpha;
				for(var i=0;i<this.seriesArray.length;i++){
					var series=this.seriesArray[i];
					if(name && series.name!=name) continue;
					context.beginPath();
					context.lineWidth=series.width;
					context.globalAlpha=series.opacity;
					context.fillStyle=series.color;
					context.strokeStyle=series.color;
					for(var j=0;j<series.moves.length;j++){
						var move=series.moves[j];
						if(move.action=="quadraticCurveTo"){
							(context[move.action])(move.x0, move.y0, move.x, move.y);
						}else if(move.action=="dashedLineTo"){
							(context[move.action])(series.moves[j-1].x, series.moves[j-1].y, move.x, move.y, move.pattern);
						}else{
							(context[move.action])(move.x, move.y);
						}
					}
					if(series.strokeOrFill=="fill"){
						context.fill();
					}else{
						context.stroke();
					}
					context.closePath();
					this.drawText(context, series);
					context.lineWidth=1;
				}
				context.lineWidth=prevWidth;
				context.fillStyle=prevFillStyle;
				context.strokeStyle=prevStrokeStyle;
				context.globalAlpha=prevGlobalAlpha;
			}
	};

	
	/* TOC()************* EASE MACHINE ************** */

	/**
	 * A simple device to make ease functions easy to use. Requests a cubic function that takes the form function (t, b, c, d)
	 * 		t = current time
	 * 		b = starting value
	 * 		c = change in value
	 * 		d = duration
	 * @param {Function} fc        The cubic function
	 * @param {Number} ms         Milliseconds to perform the function
	 * @param {Map} [startValues] Name value pairs of starting values (or pass in a single value)
	 * @param {Map} [endValues]   Name value pairs of ending values (or pass in a single value)
	 * @name  CIQ.EaseMachine
	 * @constructor
	 * @example
	 * var e=new CIQ.EaseMachine(Math.easeInOutCubic, 200);
	 * e.run(function(v){console.log(v)}, 100, 110);
	 */
	CIQ.EaseMachine=function(fc, ms, startValues, endValues){
		this.fc=fc;
		this.ms=ms;
		if(startValues || startValues===0){
			this.reset(startValues, endValues);
		}
	};

	/**
	 * Resets the EaseMachine with a new set of values
	 * @param {Map} [startValues] Name value pairs of starting values (or pass in a single value). If null then the currentValues will become the startValues (allowing for resetting or reversing of direction)
	 * @param {Map} endValues   Name value pairs of ending values (or pass in a single value)
	 * @memberOf  CIQ.EaseMachine
	 */
	CIQ.EaseMachine.prototype.reset=function(startValues, endValues){
		if(!startValues && startValues!==0) startValues=this.currentValues;
		this.hasCompleted=false;
		this.running=false;
		this.okayToRun=true;
		this.useNameValuePairs=(typeof endValues=="object");
		this.startTime=Date.now();
		if(this.useNameValuePairs){
			this.startValues=startValues;
			this.endValues=endValues;
		}else{
			this.startValues={"default": startValues};
			this.endValues={"default": endValues};
		}
		this.changeValues={};
		this.currentValues={};
		for(var n in this.startValues){
			this.changeValues[n]=this.endValues[n]-this.startValues[n];
		}
	};

	/**
	 * Returns the next set of values, or individual value
	 * @return {Map} Name value pairs of current values or current value
	 * @memberOf  CIQ.EaseMachine
	 */
	CIQ.EaseMachine.prototype.next=function(){
		var now=Date.now();
		if(now>=this.startTime+this.ms){
			now=this.startTime+this.ms;
			this.hasCompleted=true;
			this.running=false;
		}
		this.currentValues={};
		for(var n in this.changeValues){
			this.currentValues[n]=this.fc(now-this.startTime, this.startValues[n], this.changeValues[n], this.ms);
		}
		if(!this.useNameValuePairs) return this.currentValues["default"];
		return this.currentValues;
	};

	/**
	 * This will be true when the cubic has completed
	 * @type {Boolean}
	 * @memberOf  CIQ.EaseMachine
	 */
	CIQ.EaseMachine.prototype.hasCompleted=false;


	/**
	 * Runs the ease machine in a loop until completion by calling next() from within a requestAnimationFrame.
	 * @param {Function} fc Function callback, will receive the results of {@link CIQ.EaseMachine#next}
	 * @param {Map} [startValues] Name value pairs of starting values (or pass in a single value)
	 * @param {Map} [endValues]   Name value pairs of ending values (or pass in a single value)
	 * @param {Boolean} [delayFirstRun=false] Normally, the first pass of the run will happen immediately. Pass true if you want to wait for the next animation frame before beginning.
	 * @memberOf  CIQ.EaseMachine
	 */
	CIQ.EaseMachine.prototype.run=function(fc, startValues, endValues, delayFirstRun){
		if(this.afid) cancelAnimationFrame(this.afid);
		this.running=true;
		if(startValues || startValues===0){
			this.reset(startValues, endValues);
		}else if(endValues || endValues===0){
			this.reset(this.currentValues, endValues);
		}
		var self=this;
		function go(){
			self.afid=null;
			if(!self.okayToRun) return;
			var result=self.next();
			fc(result);
			if(self.hasCompleted) return;
			self.afid=requestAnimationFrame(go);
		}
		if(delayFirstRun)
			this.afid=requestAnimationFrame(go);
		else
			go();
	};

	/**
	 * Stops the ease machine from running mid-animation. Returns the current state.
	 * @return {Map} Name value pairs of current values or current value
	 * @memberOf  CIQ.EaseMachine
	 */
	CIQ.EaseMachine.prototype.stop=function(){
		if(this.afid) cancelAnimationFrame(this.afid);
		this.afid=null;
		this.okayToRun=false;
		this.running=false;
		if(typeof this.useNameValuePairs=="undefined") return {};
		if(!this.useNameValuePairs) return this.currentValues["default"];
		return this.currentValues;
	};

	/* TOC()************* RENDERER ************** */

	/**
	 * Base class for Renderers.
	 * A renderer is used to draw a complex visualization based on one or more "series" of data.
	 * This is a reusable object. Once defined and attached to a chart, it shouldn’t have to be recreated every time a symbol changed.
	 * The series inside the renderers may change with a new symbol, but the linked renderer itself remains the vehicle for adding series.
	 * @name  CIQ.Renderer
	 * @constructor
	 */
	CIQ.Renderer=function (){
	};

	/**
	 * If your render manages a yAxis then the necessary calculations (high and low) should be made here
	 * @memberOf CIQ.Renderer
	 */
	CIQ.Renderer.prototype.performCalculations=function(){};

	/**
	 * Perform drawing operations here.
	 * @memberOf CIQ.Renderer
	 */
	CIQ.Renderer.prototype.draw=function(){};

	/**
	 * Default constructor for a renderer. Override this if desired.
	 * @param  {object} config Configuration for the renderer
	 * @param  {function} [config.callback] Callback function to perform activity post-drawing, for example, creating a legend. It will be called with a 'colors' argument, which will be an array of objects containing the colors used to draw the rendering. ( Example: cb(colors); ). See example for format.
	 * @param  {string} [config.id] Handle to access the rendering in the future.  If not provided, one will be generated.
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {string} [config.params.name] Name of the renderer. Default: 'Data'.  This is used when displaying error message on screen
	 * @param  {string} [config.params.panel] The name of the panel to put the rendering on, defaults to "chart"
	 * @param  {boolean} [config.params.overChart] If set to true, will draw the rendering on top of the chart rather than as an underlay. By default rendering will be as underlay.
	 * @param  {boolean} [config.params.yAxis] Optional Y-axis object to use for the series.
	 * @param  {number} [config.params.opacity] Opacity of the rendering as a whole.  Can be overridden by an opacity set for a series.  Valid values are 0.0-1.0. Default: 1
	 * @memberOf CIQ.Renderer
	 * @example
		stxx.addSeries("NOK", {display:"NOK",data:{useDefaultQuoteFeed:true},width:4});
		stxx.addSeries("SNE", {display:"Sony",data:{useDefaultQuoteFeed:true},width:4});

		var axis=new CIQ.ChartEngine.YAxis();
		axis.position="left";
		axis.textStyle="#FFBE00";

		renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", yAxis:axis}}));

		renderer.removeAllSeries()
			.attachSeries("NOK", "#FFBE00")
			.attachSeries("SNE", "#FF9300")
			.ready();

	 */
	CIQ.Renderer.prototype.construct=function(config){
		var params=config.params?config.params:{};
		if(!params.name) params.name=CIQ.uniqueID();
		if(!params.heightPercentage) params.heightPercentage=0.7;
		if(!params.opacity) params.opacity=1;
		if(!params.type) params.type="line";
		if(params.type=="legacy" || params.type=="line" || params.type=="mountain") params.highlightable=true;
		if(!params.panel) params.panel="chart";
		this.cb=config.callback;
		this.params=params;
		this.seriesParams=[];
		this.caches={};
		this.colors={};
	};

	/**
	 * Attach a series to the renderer.
	 * This assumes that the series data *is already in the dataSet* and simply connects it to the renderer with the specified parameters. See {@link CIQ.ChartEngine#addSeries} for details on how to create a series.
	 * See {@link CIQ.ChartEngine.addSeries}.
	 *
	 * The color defined when attaching a series will supersede any color defined when a series was created. This allows you to attach the same series to multiple renderers, each rendering displaying the same series data in a different color if desired.
	 *
	 * @param  {String} field      The name of the field. Name of the field in the dataSet to use for the series.
	 * @param  {object} parameters Settings to control color and opacity of <B>each</B> series in the group. See {@link CIQ.ChartEngine#addSeries} for implementation examples. <P>Argument format can be:<ul><li> a `string` containing the color</li><li> or a more granular `object` having the following members:</li></ul>
	 * @param  {string} [parameters.fill_color_up] Color to use to fill the part when the Close is higher than the previous (#RRGGBB(AA) format or null to not draw)
	 * @param  {string} [parameters.border_color_up] Color to use to draw the border when the Close is higher than the previous (#RRGGBB(AA) format or null to not draw)
	 * @param  {number} [parameters.opacity_up] Opacity to use to fill the part when the Close is higher than the previous (0.0-1.0). Default: .4
	 * @param  {string} [parameters.fill_color_down] Color to use to fill the part when the Close is lower than the previous (#RRGGBB(AA) format or null to not draw)
	 * @param  {string} [parameters.border_color_down] Color to use to draw the border when the Close is lower than the previous (#RRGGBB(AA) format or null to not draw)
	 * @param  {number} [parameters.opacity_down] Opacity to use to fill the part when the Close is lower than the previous (0.0-1.0) default: .4
	 * @param  {string} [parameters.color] Color to use to fill the series if fill_color_up or fill_color_down is not specified (#RRGGBB(AA) format).
	 * @param  {boolean} [parameters.permanent] For line chart, whether it can be removed by the user. By default the series will not be permanent. This flag (including the default) will supersede the permanent flag of the actual series. As such, a series will not be permanent unless you set this flag to 'true', even if the series being attached was flaged set as permanent when defined. This gives the renderer most control over the rendering process.
	 * @return {CIQ.Renderer}            Returns a copy of this for chaining
	 * @memberOf CIQ.Renderer
	 * @example
			stxx.addSeries("NOK", {display:"NOK",data:{useDefaultQuoteFeed:true},width:4});

		var axis=new CIQ.ChartEngine.YAxis();
		axis.position="left";
		axis.textStyle="#FFBE00";

		renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", yAxis:axis}}));

		renderer.removeAllSeries()
			.attachSeries("NOK", "#FFBE00")
			.attachSeries("SNE", "#FF9300")
			.ready();

	 */
	CIQ.Renderer.prototype.attachSeries=function(field, parameters){
		if(!this.stx || !this.stx.chart.series[field]) return this;
		var sp={
			field: 				field,
			chartType:			this.params.type,
			display: 			this.stx.chart.series[field].parameters.display,
			border_color_up:	this.params.defaultBorders?"auto":null,
			fill_color_up:		this.stx.chart.series[field].parameters.color,
			opacity_up:			this.params.opacity,
			border_color_down:	this.params.defaultBorders?"auto":null,
			fill_color_down:	this.stx.chart.series[field].parameters.color,
			opacity_down:		this.params.opacity,
			color:				this.stx.chart.series[field].parameters.color
		};
		if(typeof parameters=="string"){
			sp.color=sp.fill_color_down=sp.fill_color_up=parameters;
		}else if(typeof parameters=="object"){
			for(var p in parameters) sp[p]=parameters[p];
			if(sp.color){
				if(!sp.fill_color_up) sp.fill_color_up=sp.color;
				if(!sp.fill_color_down) sp.fill_color_down=sp.color;
			}
		}

		this.removeSeries(field,true).seriesParams.push(sp);

		if(sp.fill_color_up!=sp.fill_color_down){
			this.colors[field+" up"]={"color":sp.fill_color_up,"opacity":sp.opacity_up,"display":sp.display?sp.display+" up":field+" up"};
			this.colors[field+" dn"]={"color":sp.fill_color_down,"opacity":sp.opacity_down,"display":sp.display?sp.display+" down":field+" down"};
		}else{
			this.colors[field]={"color":sp.fill_color_up,"opacity":sp.opacity_up,"display":sp.display?sp.display:field};
		}
		if(this.params.yAxis){
			this.stx.addYAxis(this.stx.panels[this.params.panel], this.params.yAxis);
		}
    	return this;
	};

	/**
	 * Removes a series from the renderer and the yAxis from the panel if it is not being used by any current renderers.
	 * @param  {String} field          The field name of the series.
	 * @param  {Boolean} [preserveSeries=false] Set to true to keep the series data in the CIQ.ChartEngine object.
	 * @return {CIQ.Renderer}                A copy of this for chaining
	 * @memberOf CIQ.Renderer
	 */
	CIQ.Renderer.prototype.removeSeries=function(field, preserveSeries){
		for(var sp=0;sp<this.seriesParams.length;sp++){
			if(this.seriesParams[sp].field==field){
				this.seriesParams.splice(sp,1);
				break;
			}
		}
		delete this.colors[field+" up"];
		delete this.colors[field+" dn"];
		delete this.colors[field];

		if(!preserveSeries){
			if(!this.stx.chart.series[field] || !this.stx.chart.series[field].parameters.permanent){
    			var seriesInUse=false;
				for(var plot in this.stx.chart.seriesRenderers){
					var myPlot=this.stx.chart.seriesRenderers[plot];
					for(var s=0;s<myPlot.seriesParams.length;s++){
						if(myPlot.seriesParams[s].field==field) {
							seriesInUse=true;
							break;
						}
					}
					if(seriesInUse) break;
				}
					if(!seriesInUse) {
						this.stx.deleteSeries(field, this.stx.chart);
				}

			}
		}
		this.stx.deleteYAxisIfUnused(this.stx.panels[this.params.panel], this.params.yAxis);
		return this;
	};

	/**
	 * Removes all series from the renderer and the yAxis from the panel if it is not being used by any current renderers.
	 * @param {Boolean} [eraseData=false] Set to true to erase the actual series data in the CIQ.ChartEngine otherwise it will be retained
	 * @return {CIQ.Renderer} A copy of this for chaining
	 * @memberOf CIQ.Renderer
	 */
	CIQ.Renderer.prototype.removeAllSeries=function(eraseData){
		if(eraseData){
			var arr=[];
			// Compile a list of all of the fields
    		for(var sp=0;sp<this.seriesParams.length;sp++){
    			arr.push(this.seriesParams[sp].field);
    		}
    		for(var i=0;i<arr.length;i++){
    			this.removeSeries(arr[i]);
    		}
		}
		this.seriesParams=[];
		this.colors={};
		this.stx.deleteYAxisIfUnused(this.stx.panels[this.params.panel], this.params.yAxis);
		return this;
	};

	/**
	 * Call this to immediately render the visualization, at the end of a chain of commands.
	 * @return {CIQ.Renderer} A copy of this for chaining
	 * @memberOf CIQ.Renderer
	 */
	CIQ.Renderer.prototype.ready=function(){
		this.stx.createDataSet();
		this.stx.draw();
		return this;
	};

	/**
	 * Creates a Lines renderer
	 *
	 * Note: by default the renderer will display lines as underlays. As such, they will appear below the chart ticks and any other studies or drawings.
	 *
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {Object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {number} [config.params.width] Width of the rendered line
	 * @param  {string} [config.params.subtype="none"] Subtype of rendering: "step" or "none"
	 * @param  {string} [config.params.type="line"] Type of rendering "line", "mountain"
	 * @constructor
	 * @name  CIQ.Renderer.Lines
	 *
	 * @example
		// create series for the renderer
		stxx.addSeries("NOK", {display:"NOK",data:{useDefaultQuoteFeed:true},width:4});
		stxx.addSeries("SNE", {display:"Sony",data:{useDefaultQuoteFeed:true},width:4});

		// create the y axis to assign to the renderer
		var axis=new CIQ.ChartEngine.YAxis();
		axis.position="left";
		axis.textStyle="#FFBE00";

		// create a renderer and associate it to the chart
		renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", yAxis:axis}}));

		// remove all series form the renderer (not always needed) , attach new series, and render.
		renderer.removeAllSeries()
			.attachSeries("NOK", "#FFBE00")
			.attachSeries("SNE", "#FF9300")
			.ready();

	 *
	 * @example
		// This is an example on how completely remove a renderer and all associated data.
		// This should only be necessary if you are also removing the chart itself.

		// remove all series from the renderer including series data from the masterData
  		renderer.removeAllSeries(true);

  		// detach the series renderer from the chart.
  		stxx.removeSeriesRenderer(renderer);

  		// delete the renderer itself.
  		delete renderer;
	 */
	CIQ.Renderer.Lines=function(config){
		this.construct(config);
	};
	CIQ.Renderer.Lines.ciqInheritsFrom(CIQ.Renderer, false);

	CIQ.Renderer.Lines.prototype.performCalculations=function(){
		var yAxis=this.params.yAxis, stx=this.stx;
		if(yAxis){
			var panel=stx.panels[this.params.panel];
			var fields=[];
			for(var i=0;i<this.seriesParams.length;i++){
				fields.push(this.seriesParams[i].field);
			}
			var minMax=stx.determineMinMax(stx.chart.dataSegment, fields, false, true);
			stx.calculateYAxisRange(panel, yAxis, minMax[0], minMax[1]);
			yAxis.high=minMax[1];
			yAxis.low=minMax[0];
		}
	};

	CIQ.Renderer.Lines.prototype.draw=function(){
		var chart=this.stx.panels[this.params.panel].chart;
		var seriesMap={};
		var s, seriesParams=this.seriesParams;
		for(s=0;s<seriesParams.length;s++){
			if(chart.series[seriesParams[s].field] ) { // make sure the series is still there.
				var defaultParams=CIQ.clone(chart.series[seriesParams[s].field].parameters);
				seriesMap[seriesParams[s].field]={
						parameters: CIQ.extend(CIQ.extend(defaultParams,this.params),seriesParams[s]),
						yValueCache: this.caches[seriesParams[s].field],
						useChartLegend: this.params.type=="legacy"
				};
			}
		}
		this.stx.drawSeries(chart,seriesMap, this.params.yAxis);
		for(s in seriesMap){
			this.caches[s]=seriesMap[s].yValueCache;
		}
	};

	return _exports;
});
