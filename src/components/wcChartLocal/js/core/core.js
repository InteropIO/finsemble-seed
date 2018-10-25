//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports, utility) {

	if(!_exports.SplinePlotter) _exports.SplinePlotter={};

	var CIQ=_exports.CIQ,
	$$$=_exports.$$$,
	splinePlotter=_exports.SplinePlotter;

	/*
	 * Default implementation of plotSplinePrimitive.  Load splines.js to get real splining.
	 */
	var plotSplinePrimitive=function(points, tension, context, colorPatternChanges) {
		if(!window.splineWarning) console.log("Warning: Cannot find implementation of splining.  Try loading splines.js");
		window.splineWarning=1;
		var colorPatternIndex=0;
		context.moveTo(points[0],points[1]);
		for(var i=2;i<points.length;i+=2){
			if(colorPatternChanges && colorPatternIndex<colorPatternChanges.length){
				var colorPatternChange=colorPatternChanges[colorPatternIndex];
				if(colorPatternChange.coord[0]==points[i-2] && colorPatternChange.coord[1]==points[i-1]){
					context.stroke();
					context.strokeStyle=colorPatternChange.color;
					context.setLineDash(colorPatternChange.pattern);
					context.lineDashOffset=0;
					context.lineWidth=colorPatternChange.width;
					context.beginPath();
					context.moveTo(points[i-2],points[i-1]);  //reset back to last point
					colorPatternIndex++;
				}
			}
			context.lineTo(points[i],points[i+1]);
		}
	};
	// If splines.js has not been included then set it with our default no-op implementation
	if(!_exports.SplinePlotter.plotSpline) _exports.SplinePlotter.plotSpline=plotSplinePrimitive;

	/**
	 * Gets the current time in Eastern Time Zone. This can be used as a convenience for determining open and closing times of US markets.
	 * @return {date} JavaScript Date representing the time in Eastern Time Zone
	 * @memberof CIQ
	 */
	CIQ.getETDateTime=function(){
		var d=new Date();
		return CIQ.convertTimeZone(new Date(d.getTime()+d.getTimezoneOffset()*60000),"UTC","America/New_York");
	};

	/**
	 * Converts a JavaScript date from Eastern Time Zone to the browser's local time zone. Daylight Savings Time is hard coded. @see CIQ.getETDateTime
	 * @param  {date} est JavaScript Date object representing a date/time in eastern time zone
	 * @return {date}     JavaScript Date object converted to browser's local time zone
	 * @memberof CIQ
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
	 * @memberof CIQ
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

	/**
	 * Prints out a number in US Dollar monetary representation
	 * @param  {number} val      The amount
	 * @param  {number} [decimals=2] Number of decimal places.
	 * @param  {string} [currency] Currency designation.  If omitted, will use $.
	 * @return {string}          US Dollar monetary representation
	 * // Returns $100.00
	 * CIQ.money(100, 2);
	 * @memberof CIQ
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
	 * @memberof CIQ
	 */
	CIQ.convertCurrencyCode=function(code){
		var codes={JPY:"¥",USD:"$",AUD:"A$",BRL:"R$",CAD:"CA$",CNY:"CN¥",CZK:"Kč",DKK:"kr",EUR:"€",GBP:"£",HKD:"HK$",HUF:"Ft",ILS:"₪",INR:"₹",KRW:"₩",MXN:"MX$",NOK:"kr",NZD:"NZ$",PLN:"zł",RUB:"руб",SAR:"﷼",SEK:"kr",SGD:"S$",THB:"฿",TRY:"₺",TWD:"NT$",VND:"₫",XAF:"FCFA",XCD:"EC$",XOF:"CFA",XPF:"CFPF",ZAR:"R"};
		var rt=codes[code];
		if(rt) return rt;
		return code;
	};

	/**
	 * Returns a string representation of a number with commas in thousands, millions or billions places. Note that this function does
	 * not handle values with more than 3 decimal places!!!
	 * @param  {number} val The value
	 * @return {string}     The result with commas
	 * @example
	 * // Returns 1,000,000
	 * CIQ.commas(1000000);
	 * @memberof CIQ
	 */
	CIQ.commas=function(val){
		return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	};

	/**
	 * User friendly alerts. The charting engine always uses this instead of alert() for warning or error messages. This
	 * method can be overriden as required by your user interface.
	 * @param  {string} text Alert message
	 * @example
	 * // Override with a friendlier alert mechanism!
	 * CIQ.alert=function(text){
	 * 	doSomethingElse(text);
	 * }
	 * @memberof CIQ
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
	 * @memberof CIQ
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
	 * Sets a member or style for a DOM element only if it isn't already set.
	 * This is more efficient than blindly updating the DOM.
	 * @param  {HTMLElement} node  Node to update
	 * @param  {string} member The DOM member to update
	 * @param  {string} value The value to set
	 * @memberOf  CIQ
	 * @since  4.0.0
	 */
	CIQ.efficientDOMUpdate=function(node, member, value){
		if(node[member]!==value) node[member]=value;
	};

	/**
	 * Used in conjunction, safeMouseOut and safeMouseOver ensure just a single event when the mouse moves
	 * in or out of an element. This is important because simple mouseout events will fire when the mouse
	 * crosses boundaries *within* an element. Note that this function will do nothing on a touch device where
	 * mouseout is not a valid operation.
	 * @param  {object} node A valid DOM element
	 * @param  {function} fc   Function to call when the mouse has moved out
	 * @memberof CIQ
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
	 * @memberof CIQ
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
	 * @param {object} [params] Parameters to pass to {@link CIQ#safeClickTouch}
	 * @param {boolean} [params.stopPropagation=false] If set to true then propagation will be stopped
	 * @memberOf  CIQ
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
	 * @param {object} [params.safety] An object, generated from a CIQ.safeDrag association to prevent the click from being triggered when a drag operation is released
	 * @param {boolean} [params.allowMultiple=false] If set then multiple click events can be associated with the node
	 * @param {boolean} [params.preventUnderlayClick=true] By default prevents an underlaying element from being "clicked" on a touch device 400ms after the overlay was tapped. Set to false for input fields, or any div containing input fields (body)
	 * @param {boolean} [params.absorbDownEvent=true] Ensures that a mousedown, pointerdown, touchstart event doesn't get passed to the parent.
	 * @memberof CIQ
	 * @since 11/01/2015 Removed timers in favor of a new algorithm. This algorithm allows only the first event to fire from a UI interaction to execute the fc function.
	 */
	CIQ.safeClickTouch=function(div, fc, params){
		if(!params) params={};
		var movementWatcher={};

		if(!params.allowMultiple) CIQ.clearSafeClickTouches(div);
		if(params.preventUnderlayClick!==false) params.preventUnderlayClick=true;
		if(params.absorbDownEvent!==false) params.absorbDownEvent=true;
		params.allowAnotherDevice=0;
		params.registeredClick=false;
		function closure(which, params, movementWatcher){
			return function(e){
				if(!CIQ.safeClickTouchEvent){
					if(!movementWatcher.t){
						return;  // is this up/end event related to a down/start event?
					}
					var timeSincePressed=movementWatcher.t;
					movementWatcher.t=null;
					if(timeSincePressed+1000<new Date().getTime()) return; //allow no more than 1 second for click
				}
				if(params.safety && params.safety.recentlyDragged) return;
				if(!e) e=event;
				if((e.which && e.which>=2) || (e.button && e.button>=2)) return; // ignore right clicks
				if(params.preventUnderlayClick){
					// underlay click happens when you tap on a mobile device but a second mouse event registers
					// 300 ms later on another clickable object that was beneath the menu. By default we stop this
					// secondary event using preventDefault. However, we don't want to do this if we clicked inside
					// an input tag, because that would prevent the soft keyboard from coming up. Note that modern
					// touch operating systems don't have the 300ms delay issue so this code can be eliminated once
					// older operating systems are safely retired.
					if(e.target.tagName!=="INPUT") e.preventDefault();
				}else{ // prevent touch and mouse from being clicked when we can't use preventDefault
					if(params.lastType!=which && Date.now()<params.allowAnotherDevice) return;
					params.lastType=which;
					params.allowAnotherDevice=Date.now()+1000; // 1 Second then not a coat tail mouse click
				}
				(fc)(e);
			};
		}
		function isClick(movementWatcher, down){
			return function(e){
				var x=e.clientX?e.clientX:e.pageX;
				var y=e.clientY?e.clientY:e.pageY;
				if(down){
					movementWatcher.t=new Date().getTime();
					movementWatcher.x=x;
					movementWatcher.y=y;
				} else if(movementWatcher.x){
					//allow no more than 4 pixel distance movement
					if((Math.pow(movementWatcher.x-x,2)+Math.pow(movementWatcher.y-y,2))>16){
						movementWatcher.t=null;
					}
				}
			};
		}
		var safeClickTouchEvents=div.safeClickTouchEvents;
		if(!safeClickTouchEvents) safeClickTouchEvents=div.safeClickTouchEvents=[];
		var fc1=closure("mouseup", params, movementWatcher);
		var fc2=closure("touchend", params, movementWatcher);
		var fc3=closure("pointerup", params, movementWatcher);
		var f=function(e){ e.stopPropagation(); };
		var eventHolder={};
		if(CIQ.safeClickTouchEvent){ // global override for which event to use, for instance if you want to force use of "click" or "tap"
			var fc4=closure(CIQ.safeClickTouchEvent, params);
			div.addEventListener(CIQ.safeClickTouchEvent, fc4);
			eventHolder[CIQ.safeClickTouchEvent]=fc4;
			safeClickTouchEvents.push(eventHolder);
		}else if(("onpointerup" in document) && !CIQ.noPointerEvents){
			// Internet Explorer can always use pointerup safely
			div.addEventListener("pointerdown", isClick(movementWatcher, true));
			div.addEventListener("pointermove", isClick(movementWatcher));
			div.addEventListener("pointerup", fc3);
			eventHolder.pointerup=fc3;
			if(params.absorbDownEvent){
				div.addEventListener("pointerdown", f);
				eventHolder.pointerdown=f;
			}
			safeClickTouchEvents.push(eventHolder);
		}else{
			// all in one computers can support both of these under Chrome/FF!
			div.addEventListener("mousedown", isClick(movementWatcher, true));
			div.addEventListener("mousemove", isClick(movementWatcher));
			div.addEventListener("touchstart", isClick(movementWatcher, true));
			div.addEventListener("touchmove", isClick(movementWatcher));
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
	 * @memberof CIQ
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
	 * @memberof CIQ
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

	/**
	 * Captures enter key events. Also clears the input box on escape key.
	 * @param {object} node The DOM element to attach the event to. Should be a text input box.
	 * @param {Function} cb Callback function when enter key is pressed.
	 * @memberof CIQ
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

	/**
	 * Fixes screen scroll. This can occur when the keyboard opens on an ipad or iphone.
	 * @memberof CIQ
	 */
	CIQ.fixScreen=function(){
		window.scrollTo(0,0);
	};

	/**
	 * Sets the position of the cursor within a textarea box. This is used for instance to position the cursor at the
	 * end of the text that is in a textarea.
	 * @param {object} ctrl A valid textarea DOM element
	 * @param {number} pos  The position in the text area to position
	 * @memberof CIQ
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
	 * @memberOf  CIQ
	 */
	CIQ.setValueIfNotActive=function(el, value){
		if(document.activeElement==el) return;
		el.value=value;
	};

	/**
	 * Closes the keyboard on a touch device by blurring any active input elements.
	 * @param {HTMLElement} [newFocus] Element to change focus to
	 * @memberof CIQ
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

	/**
	 * Determines whether a line intersects a box. This is used within the charting engine to determine whether the cursor
	 * has intersected a drawing.
	 * Note this function is meant to receive bx1, by1, bx2, by2, x0, y0, x1 and y1 as pixel values and not as ticks/axis values.
	 * @param  {number} bx1
	 * @param  {number} by1
	 * @param  {number} bx2
	 * @param  {number} by2
	 * @param  {number} x0
	 * @param  {number} y0
	 * @param  {number} x1
	 * @param  {number} y1
	 * @param  {string} vtype - Either "segment", "ray" or "line".  Anything else will default to segment.
	 * @param  {boolean} isLog - True if the chart is in log scale and linear values are passed in
	 * @return {boolean}       Returns true if the line intersects the box
	 * @memberof CIQ
	 * @since 4.0.0 `isLog` parameter added
	 * @since 6.0.0 `isLog` parameter removed
	 */
	CIQ.boxIntersects=function(bx1, by1, bx2, by2, x0, y0, x1, y1, vtype){

		if(arguments[9]!==undefined){
			console.warn("CIQ.boxIntersects() no longer supports isLog argument, please be sure arguments are passed in as pixels.");
		}
		var minX=Math.min(bx1,bx2);
		var maxX=Math.max(bx1,bx2);
		var minY=Math.min(by1,by2);
		var maxY=Math.max(by1,by2);
		var isRay=vtype=="ray";
		
		// First see if segment/ray lies outside the box
		if(vtype!="line"){
			if(x0<minX && x1<minX && (!isRay || x0>x1)) return false;
			if(x0>maxX && x1>maxX && (!isRay || x0<x1)) return false;
			if(y0<minY && y1<minY && (!isRay || y0>y1)) return false;
			if(y0>maxY && y1>maxY && (!isRay || y0<y1)) return false;
		}
		// Now see if all box corners land on the same side of the line
		function cornerCheck(x, y){
			return (y-y0)*(x1-x0)-(x-x0)*(y1-y0);
		}
		var map={
			a:cornerCheck(bx1,by1),
			b:cornerCheck(bx1,by2),
			c:cornerCheck(bx2,by1),
			d:cornerCheck(bx2,by2)
		};
		if(map.a>0 && map.b>0 && map.c>0 && map.d>0) return false;
		if(map.a<0 && map.b<0 && map.c<0 && map.d<0) return false;

		return true;
	};

	/**
	 * Converts a box represented by two corner coordinates [tick0,value0] and [tick1,value1] into pixel coordinates.
	 * @param {CIQ.ChartEngine} [stx] The chartEngine
	 * @param  {string} panelName  Panel on which the coordinates reside
	 * @param  {object} box Box to convert
	 * @param  {number} [box.x0]
	 * @param  {number} [box.y0]
	 * @param  {number} [box.x1]
	 * @param  {number} [box.y1]
	 * @return  {object} A converted box
	 * @memberof CIQ
	 * @since 6.0.0
	 */
	CIQ.convertBoxToPixels=function(stx, panelName, box){
		var panel=stx.panels[panelName];
		var bx0=stx.pixelFromTick(box.x0,panel.chart);
		var bx1=stx.pixelFromTick(box.x1,panel.chart);
		var by0=stx.pixelFromValueAdjusted(panel, box.x0, box.y0);
		var by1=stx.pixelFromValueAdjusted(panel, box.x1, box.y1);
		return {x0:bx0, x1:bx1, y0:by0, y1:by1};
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
	 * @memberof CIQ
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
	 * @memberof CIQ
	 */
	CIQ.yIntersection=function(vector, x){
		var x1=vector.x0, x2=vector.x1, x3=x, x4=x;
		var y1=vector.y0, y2=vector.y1, y3=0, y4=10000;
		var denom  = (y4-y3) * (x2-x1) - (x4-x3) * (y2-y1);
		var numera = (x4-x3) * (y1-y3) - (y4-y3) * (x1-x3);
		//var numerb = (x2-x1) * (y1-y3) - (y2-y1) * (x1-x3);
		//var EPS = .000001;

		var mua=numera/denom;
		if(denom===0) {
			if(numera===0) mua=1;
			else return null;
		}

		var y=y1 + (mua * (y2-y1));
		return y;
	};

	/**
	 * Determines the X value at which point Y intersects a line (vector)
	 * @param  {object} vector - Object of type {x0,x1,y0,y1}
	 * @param  {number} y      - Y value
	 * @return {number}        - X intersection point
	 * @memberof CIQ
	 */
	CIQ.xIntersection=function(vector, y){
		var x1=vector.x0, x2=vector.x1, x3=0, x4=10000;
		var y1=vector.y0, y2=vector.y1, y3=y, y4=y;
		var denom  = (y4-y3) * (x2-x1) - (x4-x3) * (y2-y1);
		var numera = (x4-x3) * (y1-y3) - (y4-y3) * (x1-x3);
		//var numerb = (x2-x1) * (y1-y3) - (y2-y1) * (x1-x3);
		//var EPS = .000001;

		var mua=numera/denom;
		if(denom===0) {
			if(numera===0) mua=1;
			else return null;
		}

		var x=x1 + (mua * (x2-x1));
		return x;
	};

	/**
	 * Get the X intersection point between two lines
	 * @memberof CIQ
	 */
	CIQ.intersectLineLineX = function(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2) {

	    var ua_t = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
	    var u_b  = (by2 - by1) * (ax2 - ax1) - (bx2 - bx1) * (ay2 - ay1);

	    var ua = ua_t / u_b;

	    return ax1 + ua * (ax2 - ax1);
	};

	/**
	 * Get the Y intersection point between two lines
	 * @memberof CIQ
	 */
	CIQ.intersectLineLineY = function(ax1, ax2, ay1, ay2, bx1, bx2, by1, by2) {

	    var ua_t = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
	    var u_b  = (by2 - by1) * (ax2 - ax1) - (bx2 - bx1) * (ay2 - ay1);

	    var ua = ua_t / u_b;

	    return ay1 + ua * (ay2 - ay1);
	};

	/**
	 * Set once after user is alerted that private browsing is enabled
	 * @memberof CIQ
	 * @type boolean
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
	 * @memberof CIQ
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

	/**
	 * Dynamically load UI elements from an external HTML file. This is accomplished by rendering raw HTML in an iframe
	 * and then cloning all of the newly created DOM elements into our main document. The iframe is then removed.
	 *
	 * The title of the iframe is checked. External content should *not* have a title. By convention, 404 or 500 errors
	 * have a title and so we use this to determine whether the iframe contains valid content or not.
	 *
	 * @param  {string}   url The external url to fetch new UI content
	 * @param  {HtmlElement} el  Element to append the UI content to, default is document.body
	 * @param  {Function} cb  A callback function to call when the new UI is available
	 * @memberof CIQ
	 * @since 6.1.0 added el argument
	 */
	CIQ.loadUI = function(url, el, cb) {
		var i = document.createElement("iframe");
		if(!el || typeof(el)=="function") {
			cb=el;  // backward compatibility
			el=document.body;
		}
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
					el.appendChild(ch);
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
	 * @memberof CIQ
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
	 * @memberof CIQ
	 */
	CIQ.loadStylesheet=function(widget, cb){
		var lnk=document.createElement("link");
		lnk.rel="stylesheet";
		lnk.type="text/css";
		lnk.media="screen";
		lnk.href=widget + "?" + Date.now();
		lnk.onload=function(){
			if(this.loaded) return;  //undocumented IE Edge bug, css files load twice.  This to prevent double-triggering of onload, which may load html file twice.
			this.loaded=true;
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
	 * @param  {HtmlElement} el  Element to append the UI content to, default is document.body
	 * @param  {Function} cb     Function to call when the widget is fully loaded
	 * @memberof CIQ
	 * @since 6.1.0 added el argument
	 */
	CIQ.loadWidget=function(widget, el, cb){
		if(!el || typeof(el)=="function") {
			cb=el;  // backward compatibility
			el=document.body;
		}
		CIQ.loadStylesheet(widget+".css",function(){
			CIQ.loadUI(widget + ".html", el, function(err){
				if(err) cb(err);
				else CIQ.loadScript(widget+".js", cb);
			});
		});
	};

	/**
	 * Checks to see if the enabled plugins are done dynamically loading. 
	 * @param {array} plugins An array of strings that define which plugins to check 
	 * The plugin names provided must match the following format: if cq-scriptiq is enabled, 'scriptiq' is the plugin name entered into the array
	 * @param {Function} cb Function to call when all the plugins are fully loaded
	 * @memberof CIQ
	 * @since 6.1.0
	 */
	CIQ.waitForPlugins=function(plugins, cb){
		var numPluginsLoaded=0;
		var numPlugins=plugins.length;
		if(!numPlugins) {
			cb();
			return;
		}
		
		for(var i=0; i<numPlugins; i++) {
			var tagName='cq-' + plugins[i];
			var element=document.getElementsByTagName(tagName)[0];
			if(element && element.hasAttribute('loaded')) {
				numPluginsLoaded++;
			}
		}

	    if (numPlugins !== numPluginsLoaded) {
	        return setTimeout(function(){
	        	CIQ.waitForPlugins(plugins, cb);
	        }, 0);
	    }

	    cb();
	};

	/**
	 * Sets the transparent parts of the canvas to the specified background color. Used to ensure a background when turning charts into images
	 * because normally the background is the background of the DIV container and not the canvas itself.
	 * @param  {object} context An HTML canvas context
	 * @param  {string} color   The color to set the background. Any valid HTML canvas color.
	 * @param  {number} width   Width to apply color (Could be less than size of canvas)
	 * @param  {number} height  Height to apply color (Could be less than size of canvas if applying branding for instance)
	 * @memberof CIQ
	 */
	CIQ.fillTransparentCanvas = function(context, color, width, height){
		var compositeOperation = context.globalCompositeOperation;
		context.globalCompositeOperation = "destination-over";
		context.fillStyle = color;
		context.fillRect(0,0,width,height);
		context.globalCompositeOperation = compositeOperation;
	};

	/**
	 * Displays a floating label over the y axis. 
	 * 
	 * Draws a 'ticked' rectangle on the canvas, using using {@link CIQ.roundRect}. 
	 * It then calls {@link CIQ.createLabel} to print the text over this background shape; which can be customized to control the text format for these labels.
	 * 
	 * Visual Reference:<br>
	 * ![tickedRect](tickedRect.png "tickedRect")
	 * @param  {object} params
	 * @param  {object} params.ctx    A valid HTML Canvas Context
	 * @param  {number} params.x      Left position of drawing on canvas
	 * @param  {number} params.top      Top position of drawing on canvas
	 * @param  {number} params.width  Width of rectangle
	 * @param  {number} params.height Height of rectangle
	 * @param  {number} params.radius Radius of rounding
	 * @param  {boolean} [params.fill]   Whether to fill the background, or just draw the rectangle border.
	 * @param  {number}  [params.txt]    Text for the label
	 * @param  {number}  [params.y]      Y position of drawing on canvas
	 * @param  {object}  [params.margin]     Margin around the text
	 * @param  {object}  [params.margin.left]     Left margin of text
	 * @param  {object}  [params.margin.top]     Top margin of text
	 * @param  {number}  [params.backgroundColor]  background color. This is the background color of the rectangle.
	 * @param  {number}  [params.color] Text color
	 * @memberof CIQ
	 * @since 3.0.0 - function signature changed: This function now takes a params object instead of 8 different parameters
	 */

	CIQ.tickedRect=function(params) {
		CIQ.rect(params);
		var tickY=Math.round(params.top+params.height/2)+0.5;
		params.ctx.beginPath();
		params.ctx.moveTo(params.x-2, tickY);
		params.ctx.lineTo(params.x, tickY);
		params.ctx.stroke();
		params.ctx.closePath();
	};

	/**
	 * Displays a floating label over the y axis. 
	 * 
	 * Draws a rectangle, with curved corners, on the canvas.
	 * It then calls {@link CIQ.createLabel} to print the text over this background shape; which can be customized to control the text format for these labels.
	 * 
	 * Visual Reference:<br>
	 * ![roundRect](roundRect.png "roundRect")
	 * @param  {object} params
	 * @param  {object} params.ctx    A valid HTML Canvas Context
	 * @param  {number} params.x      Left position of drawing on canvas
	 * @param  {number} params.top      Top position of drawing on canvas
	 * @param  {number} params.width  Width of rectangle
	 * @param  {number} params.height Height of rectangle
	 * @param  {number} params.radius Radius of rounding
	 * @param  {boolean} [params.fill]   Whether to fill the background, or just draw the rectangle border.
	 * @param  {number}  [params.txt]    Text for the label
	 * @param  {number}  [params.y]      Y position of drawing on canvas
	 * @param  {object}  [params.margin]     Margin around the text
	 * @param  {object}  [params.margin.left]     Left margin of text
	 * @param  {object}  [params.margin.top]     Top margin of text
	 * @param  {number}  [params.backgroundColor]  background color. This is the background color of the rectangle.
	 * @param  {number}  [params.color] Text color
	 * @param {string} [edge] "flush","arrow"
	 * @memberof CIQ
	 * @since 3.0.0  - function signature changed: This function now takes a params object and the drawing type instead of 8 different parameters.
	 * Also, this function will draw the label if `params.txt` is present, otherwise just the floating label outline will be drawn
	 */
	CIQ.roundRect=function(params, edge) {
		if(arguments.length === 9){
			params = {
				ctx:  arguments[0],
				x:  arguments[1],
				top:  arguments[2],
				width:  arguments[3],
				height: arguments[4],
				radius: arguments[5],
				fill: arguments[6],
				stroke: arguments[7],
				edge: arguments[8]
			};
		}
		var stroke = params.stroke;
		var x = params.x;
		var y = params.top;
		var width = params.width;
		var height = params.height;
		var radius = params.radius;
		var fill = params.fill;
		var ctx = params.ctx;
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
		var xwr=xw-radius, yhr=yh-yradius;
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
		}else if(edge=="arrow"){
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
		if(params.backgroundColor) ctx.fillStyle=params.backgroundColor;

		if (stroke) {
			ctx.stroke();
		}
		if (fill) {
			ctx.fill();
		}
		if(params.txt) CIQ.createLabel(params);
	};
	/**
	 * Adds text on the canvas for the floating label over the y axis.
	 * 
	 * Uses native canvas functions to add the text. You can override this function if you wish to customize how the text on the floating y axis labels are displayed. See example. 
	 * @param  {object}  params
	 * @param  {object}  params.ctx      A valid HTML Canvas Context
	 * @param  {number}  params.x      Left position of drawing on canvas
	 * @param  {number}  params.txt    Text for the lavel
	 * @param  {number}  params.y      Y position of drawing on canvas
	 * @param  {object}  params.margin     Margin around the text
	 * @param  {object}  params.margin.left     Left margin of text
	 * @param  {object}  params.margin.top     Top margin of text
	 * @param  {number}  params.backgroundColor  Background color of the shape drawn under the text, if any. This is used to find the text color if there is no color specified
	 * @param  {number}  params.color Text color
	 * @memberof CIQ
	 * @since 3.0.0 -  New Function
	 * @example
		// customized version which adds a dash before the label text 
		CIQ.createLabel=function(params){
			// set the vertical alignment of the text 
			params.ctx.textBaseline="middle";
			
			// set the color for the text and background color behind the text
			params.ctx.fillStyle=params.color?params.color:CIQ.chooseForegroundColor(params.backgroundColor);
			
			if(	params.ctx.fillStyle === params.backgroundColor){	
				// Best effort to pick a foreground color that isn't the same as the background!
				if(params.backgroundColor.toUpperCase()=="#FFFFFF")
					params.ctx.fillStyle="#000000";
				else
					params.ctx.fillStyle="#FFFFFF";
			}
			
			//add the text to the canvas.
			// see we are adding a dash ('- ') before the text
			params.ctx.fillText('- '+params.txt, params.x + params.margin.left, params.y + params.margin.top);
			
			// set the horizontal alignment of the text  
			params.ctx.textAlign="left";
		};
	 */

	CIQ.createLabel=function(params){
		params.ctx.textBaseline="middle";
		params.ctx.fillStyle=params.color?params.color:CIQ.chooseForegroundColor(params.backgroundColor);
		if(	params.ctx.fillStyle === params.backgroundColor){	// Best effort to pick a foreground color that isn't the same as the background!
			if(params.backgroundColor.toUpperCase()=="#FFFFFF")
				params.ctx.fillStyle="#000000";
			else
				params.ctx.fillStyle="#FFFFFF";
		}
		params.ctx.fillText(params.txt, params.x + params.margin.left, params.y + params.margin.top);
		params.ctx.textAlign="left";
	};

	/**
	 * Displays a floating label over the y axis. 
	 * 
	 * Draws a rectangle on the canvas, with an arrowhead on the screen, using using {@link CIQ.roundRect} with an `edge` setting of "arrow".  
	 * It then calls {@link CIQ.createLabel} to print the text over this background shape; which can be customized to control the text format for these labels.
	 * 
	 * Visual Reference:<br>
	 * ![roundRectArrow](roundRectArrow.png "roundRectArrow")
	 * @param  {object} params
	 * @param  {object} params.ctx    A valid HTML Canvas Context
	 * @param  {number} params.x      Left position of drawing on canvas
	 * @param  {number} params.top      Top position of drawing on canvas
	 * @param  {number} params.width  Width of rectangle
	 * @param  {number} params.height Height of rectangle
	 * @param  {number} params.radius Radius of rounding
	 * @param  {boolean} [params.fill]   Whether to fill the background, or just draw the rectangle border.
	 * @param  {number}  [params.txt]    Text for the label
	 * @param  {number}  [params.y]      Y position of drawing on canvas
	 * @param  {object}  [params.margin]     Margin around the text
	 * @param  {object}  [params.margin.left]     Left margin of text
	 * @param  {object}  [params.margin.top]     Top margin of text
	 * @param  {number}  [params.backgroundColor]  Background color. This is the background color of the rectangle.
	 * @param  {number}  [params.color] Text color
	 * @memberof CIQ
	 * @since 3.0.0 - function signature changed: This function now takes a params object instead of 8 different parameters
	 */
	CIQ.roundRectArrow = function(params) {
		CIQ.roundRect(params, "arrow");
	};

	/**
	 * Displays a floating label over the y axis. 
	 * 
	 * Draws a rectangle on the canvas, with just the right side curved corners, using using {@link CIQ.roundRect} with an `edge` setting of "flush". 
	 * It then calls {@link CIQ.createLabel} to print the text over this background shape; which can be customized to control the text format for these labels.
	 * 
	 * Visual Reference:<br>
	 * ![semiRoundRect](semiRoundRect.png "semiRoundRect")
	 * @param  {object} params
	 * @param  {object} params.ctx    A valid HTML Canvas Context
	 * @param  {number} params.x      Left position of drawing on canvas
	 * @param  {number} params.top      Top position of drawing on canvas
	 * @param  {number} params.width  Width of rectangle
	 * @param  {number} params.height Height of rectangle
	 * @param  {number} params.radius Radius of rounding
	 * @param  {boolean} [params.fill]   Whether to fill the background, or just draw the rectangle border.
	 * @param  {number}  [params.txt]    Text for the label
	 * @param  {number}  [params.y]      Y position of drawing on canvas
	 * @param  {object}  [params.margin]     Margin around the text
	 * @param  {object}  [params.margin.left]     Left margin of text
	 * @param  {object}  [params.margin.top]     Top margin of text
	 * @param  {number}  [params.backgroundColor]  Background color. This is the background color of the rectangle.
	 * @param  {number}  [params.color] Text color
	 * @memberof CIQ
	 * @since 3.0.0 - function signature changed: This function now takes a params object instead of 8 different parameters
	 */
	CIQ.semiRoundRect=function(params) {
		CIQ.roundRect(params, "flush");
	};

	/**
	 * Displays a floating label over the y axis. 
	 * 
	 * Draws a rectangle on the canvas using using {@link CIQ.roundRect} with a `radius` of 0
	 * It then calls {@link CIQ.createLabel} to print the text over this background shape; which can be customized to control the text format for these labels.
	 * 
	 * Visual Reference:<br>
	 * ![rect](rect.png "rect")
	 * @param  {object} params
	 * @param  {object} params.ctx    A valid HTML Canvas Context
	 * @param  {number} params.x      Left position of drawing on canvas
	 * @param  {number} params.top      Top position of drawing on canvas
	 * @param  {number} params.width  Width of rectangle
	 * @param  {number} params.height Height of rectangle
	 * @param  {boolean} [params.fill]   Whether to fill the background, or just draw the rectangle border.
	 * @param  {number}  [params.txt]    Text for the label
	 * @param  {number}  [params.y]      Y position of drawing on canvas
	 * @param  {object}  [params.margin]     Margin around the text
	 * @param  {object}  [params.margin.left]     Left margin of text
	 * @param  {object}  [params.margin.top]     Top margin of text
	 * @param  {number}  [params.backgroundColor]  Background color. This is the background color of the rectangle.
	 * @param  {number}  [params.color] Text color
	 * @memberof CIQ
	 * @since 3.0.0 - function signature changed: This function now takes a params object instead of 8 different parameters
	 */
	CIQ.rect=function(params) {
		params.radius = 0;
		CIQ.roundRect(params);
	};

	/**
	 * Displays floating text label, without any background shapes, over the y axis.
	 * 
	 * Calls {@link CIQ.createLabel}; which can be customized to control the text format for these labels.
	 * Will draw text in the color normally used for the background shape. For example, 'green' text for the up tick and 'red' text for a down tick. 
	 * 
	 * Visual Reference:<br>
	 * ![noop](noop.png "noop")
	 * @param  {object}  params
	 * @param  {object}  params.ctx      A valid HTML Canvas Context
	 * @param  {number}  params.x      Left position of drawing on canvas
	 * @param  {number}  params.txt    Text for the lavel
	 * @param  {number}  params.y      Y position of drawing on canvas
	 * @param  {object}  params.margin     Margin around the text
	 * @param  {object}  params.margin.left     Left margin of text
	 * @param  {object}  params.margin.top     Top margin of text
	 * @param  {number}  params.backgroundColor  Text color; since there is no background shape.

	 * @memberof CIQ
	 * @since 3.0.0 - function signature changed: This function now takes a params object instead of 8 different parameters
	 * @since 5.2.1 - Will now draw text in the color normally used for the background shape. For example, 'green' text for the up tick and 'red' text for a down tick.
	 */
	CIQ.noop=function(params) {
		params.color = params.backgroundColor;
		CIQ.createLabel(params);
	};


	/**
	 * Turns a portion of raw text into multi-line text that fits in a given width. This is used for autoformatting of annotations
	 * @param  {object} ctx    A valid HTML Canvas Context
	 * @param  {string} phrase The text
	 * @param  {number} l      The width in pixels to fit the text within on the canvas
	 * @return {array}        An array of individual lines that should fit within the specified width
	 * @memberof CIQ
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
	 * @param  {CIQ.ChartEngine} stx A chart object
	 * @return {string}     A periodicity value that can be displayed to an end user
	 * @memberof CIQ
	 */
	CIQ.readablePeriodicity=function(stx){
		var displayPeriodicity=stx.layout.periodicity;
		var displayInterval=stx.layout.interval;
		if(typeof(stx.layout.interval)=="number" && stx.layout.timeUnit){
			displayPeriodicity=stx.layout.interval*stx.layout.periodicity;
			displayInterval=stx.layout.timeUnit;
		}
		else if (typeof(stx.layout.interval)=="number" && !stx.layout.timeUnit){
			displayPeriodicity=stx.layout.interval*stx.layout.periodicity;
			displayInterval="minute";
		}
		if(displayPeriodicity%60===0 && displayInterval=="minute"){
			displayPeriodicity/=60;
			displayInterval="hour";
		}
		return displayPeriodicity + " " + stx.translateIf(displayInterval.capitalize());
	};

	/**
	 * Creates a document node which facilitates translation to other languages, if stx.translationCallback callback function is set.
	 * If there is no translationCallback, a standard text node is returned.
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {string} english The word to translate
	 * @param {string} [language] Language. Defaults to CIQ.I18N.language.
	 * @return {HTMLElement}	A node in the following form if translationCallback exists:
	 * 					<language original="english">translation</language>
	 * 							If it does not exist, a text node is returned.
	 * @memberof CIQ
	 */
	CIQ.translatableTextNode=function(stx, english, language){
		if(stx.translationCallback) {
			var translationNode=document.createElement("translate");
			translationNode.setAttribute("original",english);
			translationNode.innerHTML=stx.translationCallback(english,language);
			return translationNode;
		}
		return document.createTextNode(english);
	};

	/**
	 * <span class="animation">Animation Loop</span>
	 * Clears the canvas. Uses the fastest known method except on the legacy Android browser which had many problems!
	 * @param  {object} canvas A valid HTML canvas object
	 * @param  {object} [stx]    A chart object, only necessary for old Android browsers on problematic devices
	 * @memberof CIQ
	 */
	CIQ.clearCanvas=function(canvas, stx){
		canvas.isDirty=false;
		var ctx=canvas.context;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if(CIQ.isAndroid && !CIQ.is_chrome && !CIQ.isFF){	// Android browser last remaining
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
	CIQ.YEAR=366*CIQ.DAY;
	CIQ.DECADE=10*CIQ.YEAR-7*CIQ.DAY;

	/**
	 * Convenience function for creating a displayable month name using CIQ.monthLetters and CIQ.monthAbv.
	 * Please note that those arrays may not be utilized if the library is used in conjunction with Internationalization.
	 * This method is used primarily to create the x-axis of a chart
	 * @param  {number} i              The numerical month (0-11)
	 * @param  {boolean} displayLetters - True if just the first letter should be displayed (such as a tight display)
	 * @param  {object} [stx]            The chart object, only necessary if Internationalization is in use
	 * @return {string}                String representation of the month
	 * @memberof CIQ
	 */
	CIQ.monthAsDisplay=function(i, displayLetters,stx){
		if(displayLetters){
			if(stx && stx.monthLetters) return stx.monthLetters[i];
			return CIQ.monthLetters[i];
		}
		if(stx && stx.monthAbv) return stx.monthAbv[i];
		return CIQ.monthAbv[i];
	};

	/**
	 * Displays a time in readable form. If Internationalization is in use then the time will be in 24 hour Intl numeric format
	 * @param  {date} dt  JavaScript Date object
	 * @param  {object} [stx] Chart object if Internationalization is in use
	 * @param {number} [precision] Precision to use. If `null` then `hh:mm`. `CIQ.SECOND` then `hh:mm:ss`. If `CIQ.MILLISECOND` then `hh:mm:ss.mmmmm`
	 * @return {string}     Human friendly time, usually hh:mm
	 * @memberof CIQ
	 */
	CIQ.timeAsDisplay=function(dt, stx, precision){
		var internationalizer=stx?stx.internationalizer:null;
		if(internationalizer){
			if(precision==CIQ.SECOND)
				return internationalizer.hourMinuteSecond.format(dt);
			else if(precision==CIQ.MILLISECOND)
				return internationalizer.hourMinuteSecond.format(dt) + "." + dt.getMilliseconds();
			return internationalizer.hourMinute.format(dt);
		}
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
	};

	/**
	 * Displays a date according to the current chart settings and periodicity. It will format the date according to the folllowing order:
	 * 1. xAxis formatter
	 * 2. Internationalization
	 * 3. default
	 * 		a. Daily: mm-dd-yyyy
	 * 		b. Intraday: mm/dd hh:mm[:ss[:ms]]
	 * 
	 * This method is used in {@link CIQ.ChartEngine.AdvancedInjectable#headsUpHR} to format the floating label over the x axis, 
	 * and can be overitten as needed to achieve the desired results.
	 * 
	 * @param  {CIQ.ChartEngine} stx	  The charting object
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @param  {date} dt 	JavaScript date
	 * @return {string}		Formatted date
	 * @memberof CIQ
	 * @since 4.0.0
	 */
	CIQ.displayableDate=function(stx, chart, dt){
		function twoPlaces(val){
			if(val<10) return "0"+val;
			return val;
		}
		var displayableDate="";
		var interval=stx.layout.interval;
		var isDaily=CIQ.ChartEngine.isDailyInterval(interval);
		if(chart.xAxis.formatter){
			displayableDate=chart.xAxis.formatter(dt);
		}else if(stx.internationalizer){
			displayableDate=stx.internationalizer.monthDay.format(dt);
			if(!isDaily)
				displayableDate+=" " + stx.internationalizer.hourMinute.format(dt);
			else {
				if( interval == "month" ) displayableDate=stx.internationalizer.yearMonth.format(dt);
				else displayableDate=stx.internationalizer.yearMonthDay.format(dt);
			}
		}else{
			var m=twoPlaces(dt.getMonth()+1);
			var d=twoPlaces(dt.getDate());
			var h=twoPlaces(dt.getHours());
			var mn=twoPlaces(dt.getMinutes());
			if(isDaily) {
				displayableDate=(interval == "month")?(m + "-"):(m + "-" + d + "-");
				displayableDate+= dt.getFullYear();
			} else {
				displayableDate= m + "/" + d + " " + h + ":" + mn;
				var isSecond=(chart.xAxis.activeTimeUnit && chart.xAxis.activeTimeUnit <=CIQ.SECOND) || stx.layout.timeUnit=="second";
				var isMS=(chart.xAxis.activeTimeUnit && chart.xAxis.activeTimeUnit <=CIQ.MILLISECOND) || stx.layout.timeUnit=="millisecond";
				if (isSecond || isMS){
					var sec=twoPlaces(dt.getSeconds());
					displayableDate+= (":" + sec);

					if (isMS){
						var mil=twoPlaces(dt.getMilliseconds());
						if(mil<100) mil="0" + mil;
						displayableDate+= (":" + mil);
					}
				}
			}
		}
		return displayableDate;
	};

	/**
	 * Given a numeric price that may be a float with rounding errors, this will trim off the trailing zeroes
	 * @param  {number} price The price
	 * @return {number}       The price trimmed of trailing zeroes
	 * @memberof CIQ
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
	 * Condenses a number into abbreviated form by adding "k","m","b" or "t".
	 * This method is used in the y-axis for example with volume studies.
	 * @param  {number} txt - A numerical value
	 * @return {string}     Condensed version of the number if over 999, otherwise returns `txt` untouched
	 * @example
	 * // This will return 12m
	 * condenseInt(12000000);
	 * @memberof CIQ
	 * @since 4.0.0 now returns `txt` untouched if under 1000. Previously was removing all decimal places.
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
			else txt=txt.toString();
		}else{
			if(txt<-1000000000000) txt=Math.round(txt/100000000000)/10 + "t";
			else if(txt<-1000000000) txt=Math.round(txt/100000000)/10 + "b";
			else if(txt<-1000000) txt=Math.round(txt/100000)/10 + "m";
			else if(txt<-1000) txt=Math.round(txt/100)/10 + "k";
			else txt=txt.toString();
		}
		return txt;
	};


	/**
	 * Determines how many decimal places the security trades. This is a callback from CIQ.ChartEngine.calculateTradingDecimalPlaces and you
	 * can override this with your own functionality. The default algorithm is to check the most recent 50 quotes and find the maximum number
	 * of decimal places that the stock has traded. This will work for most securities but if your market data feed has rounding errors
	 * or bad data then you may want to supplement this algorithm that checks the maximum value by security type.
	 * @param {object} params Parameters
	 * @param  {CIQ.ChartEngine} params.stx    The chart object
	 * @param {CIQ.ChartEngine.Chart} params.chart The chart in question
	 * @param  {object} params.symbol The symbol object. If you create charts with just stock symbol then symbolObject.symbol will contain that symbol
	 * @return {number}        The number of decimal places
	 * @memberof CIQ
	 */
	CIQ.calculateTradingDecimalPlaces=function(params){
		var chart=params.chart;
		var decimalPlaces=2;
		var quotesToCheck = 50; // Check up to 50 recent quotes
		var masterData=chart.masterData;
		if(masterData && masterData.length > quotesToCheck){
			// exclude the current quote by setting i=2 in case animation is enabled. Animation uses very large decimals to allow for smooth movements.
			for(var i=2;i<quotesToCheck;i++){
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
	 * @param  {CIQ.ChartEngine} stx    The chart object
	 * @param  {array} points  The set of points, this is an array of chart coordinates in array form
	 * 							e.g. [[x1,y1],[x2,y2]].  The points should be arranged to form a loop;
	 * 							the loop need not be closed.
	 * @param  {object} params  parameters
	 * @param  {string} [params.color]  color to fill the area
	 * @param  {number} [params.opacity] opacity of fill, 0 to 1.  Defaults to 0.1
	 * @param  {number} [params.tension] Tension for splining. Requires "js/thirdparty/splines.js"
	 * @param  {string} [params.panelName] Name of panel to draw on.  If omitted or invalid, area may fill over top or bottom of plot area
	 * @param  {CIQ.ChartEngine.YAxis} [params.yAxis] The y-axis for the area (will use default axis if not specified)
	 * @since
	 * <br>&bull; 01-2015-20 `params.panelName` added
	 * <br>&bull; 4.0.0 Combined arguments into params, added tension
	 * <br>&bull; 5.2.0 `params.yAxis` added
	 * @memberof CIQ
	 */
	CIQ.fillArea=function(stx, points, params){
		if(!points.length) return;
		var ctx=stx.chart.context;
		var globalAlpha=ctx.globalAlpha;
		var color=arguments[2], opacity=arguments[3], panelName=arguments[4], tension=0, yAxis=null;
		if(params && typeof(params)=="object"){
			color=params.color;
			opacity=params.opacity;
			tension=params.tension;
			panelName=params.panelName;
			yAxis=params.yAxis;
		}
		if(!opacity && opacity!==0) opacity=0.2;
		if(color=="auto") color=stx.defaultColor;
		ctx.globalAlpha=opacity;
		if(color) ctx.fillStyle=color;

		var b=Number.MAX_VALUE;
		var t=b*-1;
		var panel=stx.panels[panelName];
		if(panel){
			t=(yAxis||panel.yAxis).top;
			b=(yAxis||panel.yAxis).bottom;
			ctx.save();
			ctx.beginPath();
			ctx.rect(panel.left, t, panel.width, b-t);
			ctx.clip();
		}
		ctx.beginPath();
		var i;
		if(tension){
			var flatPoints=[];
			for(i=0;i<points.length-2;i++){
				flatPoints.push(points[i][0],points[i][1]);
			}
			splinePlotter.plotSpline(flatPoints, tension, ctx);
			for(i=points.length-2;i<points.length;i++){
				ctx.lineTo(Math.round(points[i][0]),Math.round(points[i][1]));
				// Chrome 58/59 issue with gradient fills.  Less severe if we round these last 2 points.
			}
		}else{
			ctx.moveTo(points[0][0],points[0][1]);
			for(i=1;i<points.length;i++){
				ctx.lineTo(points[i][0],points[i][1]);
			}
		}
		ctx.closePath();
		ctx.fill();
		if(panel) ctx.restore();

		ctx.globalAlpha=globalAlpha;
	};

	/**
	 * Fills an area on the chart delimited by non intersecting top and bottom bands (channel), usually created by a study.
	 * @param {CIQ.ChartEngine} stx The chart object
	 * @param {object} parameters The configuration parameters
	 * @param {string} parameters.panelName The name of the panel
	 * @param {boolean} parameters.noSlopes If set then chart will fill rectangles with no transition lines between levels
	 * @param {string} parameters.topBand The name of the quote field to use as the top band
	 * @param {string} parameters.bottomBand The name of the quote field to use as the bottom band
	 * @param {number} parameters.opacity The color opacity/transparency as a decimal number (1= full opacity / no transparency)
	 * @param {string} parameters.color The fill color
	 * @memberof CIQ
	 * @since 4.1.2 Removed quotes argument; function always uses dataSegment.
	 * @example
	 * CIQ.prepareChannelFill(stx,{"color":dngradient,"opacity":1,"panelName":sd.name,"topBand":"Zero "+sd.name,"bottomBand":"Under "+sd.name});
	 */
	CIQ.prepareChannelFill=function(stx, parameters){
		if(!parameters || parameters instanceof Array) parameters=arguments[2];  // backwards compatibility for when quotes was the second argument
		if(!parameters.gapDisplayStyle && parameters.gapDisplayStyle!==false) parameters.gapDisplayStyle=parameters.gaps;
		var panel=stx.panels[parameters.panelName], chart=stx.chart, strokeStyle=chart.context.strokeStyle;

		var saveParams={noDraw:parameters.noDraw, gapDisplayStyle:parameters.gapDisplayStyle};
		var chParams=CIQ.ensureDefaults(parameters,{noDraw:true, gapDisplayStyle:{}, yAxis:panel.yAxis});

		var rcTop=stx.plotDataSegmentAsLine(parameters.topBand, panel, chParams);
		var rcBottom=stx.plotDataSegmentAsLine(parameters.bottomBand, panel, chParams);
		parameters.noDraw=saveParams.noDraw; parameters.gapDisplayStyle=saveParams.gapDisplayStyle;
		var points=[];
		for(var t=0;t<rcTop.points.length;t+=2){
			points.push([rcTop.points[t],rcTop.points[t+1]]);
		}
		for(var b=rcBottom.points.length-1;b>=0;b-=2){
			points.push([rcBottom.points[b-1],rcBottom.points[b]]);
		}
		CIQ.fillArea(stx, points, parameters);
		return;
	};

	/**
	 * Fills an area on the chart delimited by a series line closed off by a horizontal threshold line, usually created by a study.
	 * @param {CIQ.ChartEngine} stx The chart object
	 * @param {object} parameters The configuration parameters
	 * @param {string} [parameters.panelName] The name of the panel
	 * @param {string} [parameters.band] The name of the quote field to use as the series line
	 * @param {number} [parameters.threshold] The price where the horizontal line hits yaxis/series to enclose the fill area.  If not set will look to parameters.reverse to determine if threshold is the lowest or highest value of the plot.
	 * @param {boolean} [parameters.reverse] Valid only if parameters.threshold is not set.  If this parameter is set to true, threshold will be highest value of plot.  Otherwise, threshold will be lowest value of plot.
	 * @param {number} [parameters.direction] 1 to fill from the threshold upwards or -1 to fill from the threshold downwards
	 * @param {object} [parameters.edgeHighlight] Set to either a color or a Styles object as returned from {@link CIQ.ChartEngine#canvasStyle} to draw the threshold line.
	 * @param {object} [parameters.edgeParameters] The parameters to draw the threshold line as required by {@link CIQ.ChartEngine#plotLine}
	 * @param {object} [parameters.gapDisplayStyle] Gap object as set by See {@link CIQ.ChartEngine#setGapLines}.
	 * @param {number} [parameters.opacity] The color opacity/transparency as a decimal number (1= full opacity / no transparency).  Default is 0.3.
	 * @param {boolean} [parameters.step] True for a step chart
	 * @param {number} [parameters.tension] Tension for splining. Requires "js/thirdparty/splines.js"
	 * @param {string} [parameters.color] The fill color
	 * @param {boolean} [parameters.roundOffEdges] Round the first and last point's X value to the previous and next integer, respectively.
	 * @param {CIQ.ChartEngine.YAxis} [parameters.yAxis] The y-axis for the band (will use default axis if not specified)
	 * @memberof CIQ
	 * @since
	 * <br>&bull; 4.0.0 Added `parameters.reverse`, made `parameters.threshold` optional in case filling to top or bottom of panel
	 * <br>&bull; 4.1.2 Removed quotes argument; function always uses dataSegment.
	 * <br>&bull; 5.2.0 `params.yAxis` added
	 * <br>&bull; 5.2.0 `parameters.gaps` has been deprecated and replaced with `parameters.gapDisplayStyle`
	 * @example
	 * if(sd.outputs.Gain) CIQ.preparePeakValleyFill(stx,{panelName:sd.panel, band:"Result " + sd.name, threshold:sd.study.centerline, direction:1, color:sd.outputs.Gain});
	 * if(sd.outputs.Loss) CIQ.preparePeakValleyFill(stx,{panelName:sd.panel, band:"Result " + sd.name, threshold:sd.study.centerline, direction:-1, color:sd.outputs.Loss});
	 */
	CIQ.preparePeakValleyFill=function(stx, parameters){
		if(!parameters || parameters instanceof Array) parameters=arguments[2];  // backwards compatibility for when quotes was the second argument
		if(!parameters.gapDisplayStyle && parameters.gapDisplayStyle!==false) parameters.gapDisplayStyle=parameters.gaps;
		var panel=stx.panels[parameters.panelName], yAxis=panel.yAxis, chart=stx.chart, context=chart.context, strokeStyle=context.strokeStyle;

		var saveParams={noDraw:parameters.noDraw, gapDisplayStyle:parameters.gapDisplayStyle};
		var rc=stx.plotDataSegmentAsLine(parameters.band, panel, CIQ.ensureDefaults(parameters, {noDraw:true, gapDisplayStyle:{}}));
		parameters.noDraw=saveParams.noDraw; parameters.gapDisplayStyle=saveParams.gapDisplayStyle;
		var threshold=parameters.threshold, direction=parameters.direction, reverse=parameters.reverse, gapDisplayStyle=parameters.gapDisplayStyle;

		if(parameters.yAxis) yAxis=parameters.yAxis;
		var yMax=-Number.MAX_VALUE, yMin=Number.MAX_VALUE, yThresh=reverse?yMax:yMin;
		if(threshold || threshold===0) yThresh=stx.pixelFromPrice(threshold, panel, yAxis);  //where threshold hits yaxis

		var points=[], length=rc.points.length;
	    for(var i=0;i<length;i+=2){
	    	var x=rc.points[i], y=rc.points[i+1], x1, y1;
	    	if(parameters.roundOffEdges){  // round off to whole pixels so color interpolation does not occur when used with fillIntersection
	    		if(i===0) x=Math.floor(x);	    		
	    		else if(i+2==length) x=Math.ceil(x);
	    	}
	    	if(isNaN(y)) continue;
	    	var limit=(y>yThresh && direction>0) || (y<yThresh && direction<0);
	    	if(!limit) {
	    		points.push([x,y]);
	    		yMax=Math.max(y,yMax);
	    		yMin=Math.min(y,yMin);
	    	}
    		if(i<length-3){
    			x1=rc.points[i+2]; y1=rc.points[i+3];
	    		if((y<yThresh && y1>yThresh) || (y>yThresh && y1<yThresh)){
		    		x+=(yThresh-y)*(x1-x)/(y1-y);
					points.push([x,yThresh]);
	    		}
	    	}
	    }
	    length=points.length;
	    if(!length) return;

    	var edgeParameters=parameters.edgeParameters, edgeHighlight=parameters.edgeHighlight;
	    if(edgeHighlight){
	    	if(edgeParameters.lineWidth>100) edgeParameters.lineWidth=1; // trap case where no width is specified in the css
	    	for(var p=0;p<length-1;p++){
	    		var point0=points[p], point1=points[p+1];
	    		if(point0[1]==yThresh && point1[1]==yThresh) continue;   // here we avoid drawing a horizontal line along the threshold
	    		if(point0[0]==point1[0] && stx.layout.candleWidth>=1){  // here we try to avoid drawing a vertical line to the threshold (like a gap boundary)
	    			if(point0[1]==yThresh && points[p-1] && points[p-1][1]==yThresh) continue;
	    			if(point1[1]==yThresh && points[p+2] && points[p+2][1]==yThresh) continue;
	    		}
	    		stx.plotLine(point0[0], point1[0], point0[1], point1[1], parameters.edgeHighlight,"segment", chart.context, panel, edgeParameters);
	    	}
	    }
	    if(!threshold && threshold!==0) {
	    	yThresh=reverse ? Math.min(yMin, yAxis.top) : Math.max(yMax, yAxis.bottom);
	    }
	    points.push([points[length-1][0],yThresh],[points[0][0],yThresh]);

	    var opacity=parameters.opacity;
	    if(!opacity && opacity!==0) parameters.opacity=0.3;
		CIQ.fillArea(stx, points, parameters);
		// Now fill in the mountain area under the gap, if required
		if(gapDisplayStyle && gapDisplayStyle.color &&
			gapDisplayStyle.fillMountain &&
			!parameters.tension &&
			!CIQ.isTransparent(gapDisplayStyle.color) &&
			!CIQ.isTransparent(parameters.color)/*need this last check for baseline_mountain to render properly*/){
			context.save();
			if(context.fillStyle instanceof CanvasGradient){
				var gradient=context.createLinearGradient(0,(direction===1?panel.top:panel.bottom),0,yThresh);
				gradient.addColorStop(0,CIQ.hexToRgba(CIQ.colorToHex(gapDisplayStyle.color),60));
				gradient.addColorStop(1,CIQ.hexToRgba(CIQ.colorToHex(gapDisplayStyle.color),10));
				context.fillStyle=gradient;
			}else{
				context.fillStyle=gapDisplayStyle.color;
			}
			var poly=[];
			var myParams={
				opacity:parameters.opacity,
				panelName:parameters.panelName
			};
		    for(i=0;i<rc.gapAreas.length;i++){
		    	var datum=rc.gapAreas[i];
		    	var start=datum.start;
		    	var end=datum.end;
		    	var thresh=datum.threshold;
		    	if(start){
		    		poly=[[start[0],start[1]],[start[0],thresh]];
		    	}else{
		    		poly.push([end[0],thresh],[end[0],parameters.step?poly[0][1]:end[1]]);
		    	}
		    	if(poly.length==4) {
		    		CIQ.fillArea(stx, poly, myParams);
	    			if(parameters.step){
	    				stx.plotLine(poly[0][0], poly[3][0], poly[0][1], poly[0][1], gapDisplayStyle, "segment", context, panel, gapDisplayStyle);
	    				stx.plotLine(poly[3][0], poly[3][0], poly[0][1], poly[3][1], gapDisplayStyle, "segment", context, panel, gapDisplayStyle);
	    			}else{
	    				stx.plotLine(poly[0][0], poly[3][0], poly[0][1], poly[3][1], gapDisplayStyle, "segment", context, panel, gapDisplayStyle);
	    			}
		    	}
		    }
			context.restore();
		}
		parameters.opacity=opacity;
	};

	/**
	 * Fills an area on the chart delimited by intersecting bands.
	 *
	 * Bands can be anchored by different y-axis as determined by the `parameters.topAxis` and `parameters.bottomAxis` parameters.
	 * @param {CIQ.ChartEngine} stx The chart object
	 * @param {string} panelName The name of the panel
	 * @param {object} parameters The configuration parameters
	 * @param {string} parameters.topBand The name of the quote field to use as the top band
	 * @param {string} parameters.bottomBand The name of the quote field to use as the bottom band
	 * @param {string} [parameters.topSubBand] Name of the field within the top band to use, for example when plotting a series
	 * @param {string} [parameters.bottomSubBand] Name of the field within the bottom band to use, for example when plotting a series
	 * @param {string} parameters.topColor The color of the top band, used to fill in a cloud whose top edge is the topBand
	 * @param {string} parameters.bottomColor The color the bottom band, used to fill in a cloud whose top edge is the bottomBand
	 * @param {number} [parameters.tension] Tension for splining. Requires "js/thirdparty/splines.js"
	 * @param {CIQ.ChartEngine.YAxis} parameters.topAxis The y-axis for the top band (will use default axis if not specified)
	 * @param {CIQ.ChartEngine.YAxis} parameters.bottomAxis The y-axis for the bottom band (will use default axis if not specified)
	 * @param {boolean} parameters.skipTransform If true then any transformations (such as comparison charting) will not be applied
	 * @param {number} parameters.opacity The color opacity/transparency as a decimal number (1= full opacity / no transparency).  Default is 0.3.
	 * @memberof CIQ
	 * @since
	 * <br>&bull; 4.0.0 Changed `sd` argument to `panelName` argument, added `parameters.topColor`, `parameters.bottomColor`, `parameters.opacity` and `parameters.skipTransform`, removed `parameters.fillFuture`
	 * <br>&bull; 4.1.2 Removed quotes argument; function always uses dataSegment.
	 * @example
		var parameters={
			topBand: "Leading Span A " + sd.name,
			bottomBand: "Leading Span B " + sd.name,
			topColor: "green",
			bottomColor: "red"
		};
		CIQ.fillIntersecting(stx, sd.panel, parameters)
	 */
	CIQ.fillIntersecting=function(stx, panelName, parameters){
		if(!parameters || parameters instanceof Array) parameters=arguments[3];  // backwards compatibility for when quotes was the second argument
		var topBand=parameters.topBand, bottomBand=parameters.bottomBand;
		var topSubBand=parameters.topSubBand, bottomSubBand=parameters.bottomSubBand;
	    var topColor=parameters.topColor, bottomColor=parameters.bottomColor;
		var panel=panelName;
		if(panel.panel) {  // backwards compatibility, where this argument is really a studyDescriptor
		    if(panel.outputs && panel.outputMap){
		    	if(!topColor) topColor=panel.outputs[panel.outputMap[topBand]];
		    	if(!bottomColor) bottomColor=panel.outputs[panel.outputMap[bottomBand]];
			}
			panel=panel.panel;
		}
		panel=stx.panels[panel];

		//make a copy of what's there now
		var context=stx.chart.context;
		var sctx=stx.scratchContext;
		if(!sctx) {
			var scratchCanvas=context.canvas.cloneNode(true);
			sctx=stx.scratchContext=scratchCanvas.getContext("2d");
			sctx.canvas=scratchCanvas;
		}
		sctx.canvas.height=context.canvas.height;
		sctx.canvas.width=context.canvas.width;
		sctx.drawImage(context.canvas,0,0);
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);

		//then fill the intersections
		var alpha=0.3;
		if(parameters.opacity) alpha=parameters.opacity;
		context.save();
		context.globalCompositeOperation="xor";

	    var params={
			band: topBand,
			subField: topSubBand,
			color: topColor,
			opacity: 1,
			panelName: panel.name,
			yAxis: parameters.topAxis,
			skipTransform: parameters.skipTransform,
			tension: parameters.tension,
			roundOffEdges: true
		};
		CIQ.preparePeakValleyFill(stx, params);

		CIQ.extend(params,{
			band: bottomBand,
			subField: bottomSubBand,
			color: bottomColor,
			yAxis: parameters.bottomAxis
		});
		CIQ.preparePeakValleyFill(stx, params);

		//now redraw with correct alpha
		context.globalAlpha=alpha;
		context.globalCompositeOperation="copy";
		context.scale(1/stx.adjustedDisplayPixelRatio,1/stx.adjustedDisplayPixelRatio);
		context.drawImage(context.canvas,0,0);

		//finally, restore what we copied, but _under_ the intersected fills we just made
		context.globalAlpha=1;
		context.globalCompositeOperation="destination-over";
		context.drawImage(stx.scratchContext.canvas,0,0);

		context.restore();
	};

	/**
	 * Draws an item in the legend and returns the position for the next item
	 * @param {CIQ.ChartEngine} stx The chart object
	 * @param  {array} xy    An X,Y tuple (from chart.legend)
	 * @param  {string} label The text to print in the item
	 * @param  {string} color The color for the background of the item
	 * @return {array}       A tuple containing the X,Y position for the next the item
	 * @memberof CIQ
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
	 * Default function to draw a legend for the series that are displayed on the chart.
	 * 
	 * See {@link CIQ.ChartEngine.Chart#legendRenderer} for activation and customization details.
	 * 
	 * @param {CIQ.ChartEngine} stx The chart object to draw
	 * @param  {object} params parameters for drawing the legend
	 * @param  {CIQ.ChartEngine.Chart} [params.chart] The chart object
	 * @param  {object} [params.legendColorMap] A map of series names to colors and display symbols ( example  IBM:{color:'red', display:'Int B M'} )
	 * @param  {object} [params.coordinates] Coordinates upon which to draw the items, in pixels relative to top left of panel ( example  {x:50, y:0} ).  If null, uses chart.legend
	 * @param  {boolean} [params.noBase] Set to true to not draw the base (the chart symbol's color) in the legend
	 * @memberof CIQ
	 */
	CIQ.drawLegend=function(stx, params){
		var coordinates=params.coordinates;
		var context=stx.chart.context;
		context.textBaseline="top";
		var rememberFont=context.font;
		stx.canvasFont("stx-legend",context);

		var chart=params.chart;
		if(!coordinates) coordinates=chart.legend;
		var xy=[coordinates.x, coordinates.y];
		var lineColor=stx.defaultColor;

		for(var i=0;i<2;i++){ // loop twice, first for the base then again for the series
			for(var field in params.legendColorMap){
				var legendItem=params.legendColorMap[field];
				if(legendItem.isBase && (i || params.noBase)) continue;
				if(!legendItem.isBase && !i) continue;
				var c;
				if(legendItem.color instanceof Array){
					var colors=legendItem.color;
					for(c=colors.length-1;c>=0;c--){
						if(CIQ.isTransparent(colors[c])) colors.splice(c,1);
					}
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
				}else{
					lineColor=null;
				}
				if(lineColor) {
					var display = field;
					if (legendItem.display){
						display = legendItem.display;
					}
					if(!display){
						if(chart.symbolDisplay){
							display=chart.symbolDisplay;
						}else{
							display=chart.symbol;
						}
					}
					if(xy[0]+context.measureText(display).width>chart.panel.right){
						xy=[coordinates.x, coordinates.y+context.measureText("M").width+6];  // M is squarish, with width roughly equaling height: https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
					}
					xy=CIQ.drawLegendItem(stx, xy, display, lineColor, legendItem.opacity);
				}
			}
		}
		context.font=rememberFont;
	};


	/**
	 * This method will return an tuple [min,max] that contains the minimum
	 * and maximum values in the series where values are series[field]
	 * @param {array} series The series
	 * @param {string} field The name of the series to look at
	 * @param {string} subField The name of the field within the series to look at
	 * @param {boolean} highLow True when comparing max High/min Low vs a specific field
	 * @return {array} Tuple containing min and max values in the series
	 * @memberof CIQ
	 * @since 5.1.0 added subField, highLow arguments
	 */
	CIQ.minMax=function(series, field, subField, highLow){
	    var min=Number.MAX_VALUE;
	    var max=Number.MAX_VALUE*-1;
        if(!subField) subField="Close";
	    var highField=highLow?"High":subField;
	    var lowField=highLow?"Low":subField;
	    for(var i=0;i<series.length;i++){
	    	var entry=series[i];
	    	if(!entry) continue;
	        var fVal=entry[field];
	        if(!fVal && fVal!==0) continue;
	        var sfVal=fVal;
	        if(typeof(fVal)==="object") sfVal=fVal[highField];
	        if(!isNaN(sfVal) && (sfVal || sfVal===0)){
		        max=Math.max(max, sfVal);
	        }
	        if(typeof(fVal)==="object") sfVal=fVal[lowField];
	        if(!isNaN(sfVal) && (sfVal || sfVal===0)){
	        	min=Math.min(min, sfVal);
	        }
	    }
	    return [min,max];
	};

	/**
	 * Returns true if two symbols match. Symbols can be strings or symbolObjects. By default, the "symbol" member is compared, and then
	 * a "source" member if one exists.
	 * If the objects have an "equals()" function member then that will be used for comparison.
	 * You can override this with your own method if you have other requirements.
	 * @param  {object} left  Symbol object
	 * @param  {object} right Symbol object
	 * @return {boolean}       true if the same
	 * @memberOf  CIQ
	 */
	CIQ.symbolEqual=function(left, right){
		if(!left || !right) return false;
		if(typeof left!="object") left={symbol:left};
		if(typeof right!="object") right={symbol:right};
		if(typeof left.equals=="function"){
			return left.equals(right);
		}
		var l=left.symbol;
		var r=right.symbol;
		if(l) l=l.toUpperCase();
		if(r) r=r.toUpperCase();
		if(l!=r) return false;
		if(left.source!=right.source) return false;
		return true;
	};


	/**
	 * Convenience function to iterate through the charts masterData and add a data member.
	 * Used to load initial data for additional series and study symbols and should normally not be called directly. Unless used inside a study initialize function; use {@link CIQ.ChartEngine#addSeries} or {@link CIQ.ChartEngine#updateChartData} instead.
	 * Can be used with any array of data objects which contains at least the 'DT' (date in javascript format) and 'Close' ( close/last price ) elements of an [OHLC object](index.html#data-format).
	 * @param {object} params Parameters object
	 * @param {CIQ.ChartEngine} [params.stx]       	A chart object
	 * @param {array} [params.data]		 			The data to add (which should align or closely align with the chart data by date)
	 * @param {array} [params.fields] 				The fields from the incoming data objects to extract and add as the new members in each masterData object. One new member will be added per field using the exact same name as in the incoming data. Example: (for each filed name in the array) masterData[mIterator][fieldN]=data[dIterator][fieldN]. Takes precedence over `createObject`, `label` and `fieldForLabel` parameters.  Use fields=["*"] to copy all fields in the data object.
	 * @param {string} [params.label]     			The name of the new member to add into each masterData object. Example: masterData[mIterator][label]=data[dIterator]["Close"]. Required unless "fields" is specified.
	 * @param {string} [params.createObject] 		If truthy, then each complete incoming data object will be assigned to the new label member in each masterData object. If set to "aggregate", will consolidate the OHLV data with the new data. The data object is expected to be a properly formatted OHLC record, or at least contain a 'Close' price, otherwise this parameter will not be honored. Example: masterData[mIterator][label]=data[dIterator]. This behavior is mutually exclusive with `fields`. <br>If the data object contains a 'Value' field, this parameter will not be honored and instead the 'Value' field will be used as follows: masterData[mIterator][label] = data[dIterator]["Value"];
	 * @param {string} [params.fieldForLabel="Close"] 	If set, this will be the field from each incoming data object that will be copied into the new label member in each masterData object. If not set, "Close" or "Value" is used, whichever exists; and if neither exists, it will attempt to copy over a field matching the `label` name. Example: masterData[mIterator][label]=data[dIterator][fieldForLabel]. This behavior is mutually exclusive with `fields` and `createObject`.
	 * @param {boolean} [params.fillGaps]			If true then gaps in data will be filled by carrying forward the value of from the previous bar.
	 * @param {boolean} [params.noCleanupDates]		If true then dates have been cleaned up already by calling {@link CIQ.ChartEngine#doCleanupDates}, so do not do so in here.
	 * @param {CIQ.ChartEngine.Chart} [params.chart]   The chart to update
	 * @memberof CIQ
	 * @example
	 * //data element format if neither fields, fieldForLabel or createObject are used
	 * {DT:epoch,Date:strDate,Value:value}
	 * {DT:epoch,Date:strDate,Close:value }
	 * //data element format if fields is used
	 * {DT:epoch,Date:strDate,Field1:value,Field2:value,Field3:value,Field4:value}
	 * //data element format if createObject is used
	 * {DT:epoch,Date:strDate,AnyOtherData:otherData,MoreData:otherData,...}
	 * @since
	 * <br>&bull; 04-2015 added
	 * <br>&bull; 15-07-01 fieldForLabel argument
	 * <br>&bull; 3.0.0 all data sent in will be forced into the chart. Dates are no longer required to be exact matches (minutes, hours, seconds, milliseconds) in order to show up in comparisons.
	 * <br>&bull; 4.0.0 Arguments are now parameterized. Backward compatibility with old signature.
	 * <br>&bull; 4.0.0 Added ability to specify copying of all fields by setting params.fields=["*"]
	 * <br>&bull; 5.2.0 enhanced parameter `createObject` to take a string
	 * <br>&bull; 5.2.0 added parameter noCleanupDates
	 */
	CIQ.addMemberToMasterdata = function(params) {
		if(params.constructor===CIQ.ChartEngine){

			params={
				stx: arguments[0],
				label: arguments[1],
				data: arguments[2],
				fields: arguments[3],
				createObject: arguments[4],
				fieldForLabel: arguments[5]
			};
		}
		var stx=params.stx;
		var label=params.label;
		var data=params.data;
		var fields=params.fields;
		var createObject=params.createObject;
		var fieldForLabel=params.fieldForLabel;

		var chart=params.chart?params.chart:stx.chart;
		
		if(!params.noCleanupDates) stx.doCleanupDates(data,stx.layout.interval);

		var series=stx.getSeries({symbol: label, chart:chart});

		if(data && data.constructor==Object) data=[data]; // When developer mistakenly sends an object instead of an array of objects
		if (!data || !data.length) return;

		var mIterator = 0, cIterator = 0, masterData=chart.masterData, layout=stx.layout, m, c;
		if(!masterData){
			masterData=[];
		}

		var defaultPlotField=(stx.chart && stx.chart.defaultPlotField)?stx.chart.defaultPlotField:null;
		var isLineType=!stx.chart.highLowBars && !stx.highLowBars[stx.layout.chartType];

		function aggregate(m,c){
			if(!m || typeof(m)!="object"){
				m=c;
				return m;
			}
			var prior={
				"Close":m.Close,
				"High":m.High,
				"Low":m.Low,
				"Open":m.Open,
				"Volume":m.Volume
			};
			m=c;
			for(var p in prior){
				if(m.Close===null){  // Close is not set, nothing else is valid (it's a gap)
					if(m[p]!==undefined) m[p]=null;
				}
				else if(typeof(m[p])!=="number") m[p]=prior[p]; // new data invalid, use original data
				else if(typeof(prior[p])==="number") {  // aggregate the data
					if(p=="Open") m.Open=prior.Open;
					else if(p=="Low" && m.Low>prior.Low) m.Low=prior.Low;
					else if(p=="High" && m.High<prior.High) m.High=prior.High;
					else if(p=="Volume") m.Volume+=prior.Volume;
				}
			}
			return m;
		}

		// inject data from c into m
		function injectData(m,c){
			if (fields && fields.length) { // Case 1, copy the [several] specified fields from new object to masterData object
				if(fields[0]=="*"){  // copy all fields
					CIQ.extend(m, c);
				}else{
					for (var i = 0; i < fields.length; i++) {
						m[fields[i]] = c[fields[i]];
					}
				}
			} else if (createObject){ // Case 2, the new object will become a child object of the masterData object
				if(c.Value !== undefined) { // If "Value" is in the new object use that
					m[label] = c.Value;
					return;
				}else if(createObject=="aggregate"){
					m[label] = aggregate(m[label],c);
				}else{
					m[label] = c;
				}
				// If we don't set this here, the study calculations will fail
				var m_=m[label];
				if(typeof(m_.Close)=="number"){
					if(typeof(m_.Open)!="number") m_.Open=m_.Close;
					var high=Math.max(m_.Open, m_.Close), low=Math.min(m_.Open, m_.Close);
					if(typeof(m_.High)!="number" || m_.High<high) m_.High=high;
					if(typeof(m_.Low)!="number" || m_.Low>low) m_.Low=low;
				}
				if(m_.Volume && typeof m_.Volume !== "number") m_.Volume=parseInt(m_.Volume,10);
			} else if (fieldForLabel) { // Case 3, copy the data from one label (fieldForLabel) to another (label)
				m[label] = c[fieldForLabel];
			} else if (isLineType && defaultPlotField && c[defaultPlotField] !== undefined) { // If a default field on the chart has been provided, then use that if it's in the new object
				m[label] = c[defaultPlotField];
			} else if (layout.adj && c.Adj_Close !== undefined) { // If Adjusted close is in the new object, use that
				m[label] = c.Adj_Close;
			} else if (c.Close !== undefined) { // If Close is in the new object use that
				m[label] = c.Close;
			} else if(c.Value !== undefined) { // If "Value" is in the new object use that
				m[label] = c.Value;
			}else { // Default to copying the same label from the old to the new object.
				m[label] = c[label];
			}
		}

		// Binary search for next relevant masterData record, with the following modifications:
		// 1. Always check the very next record, since that is most likely
		// 2. Before search, check last record
		function fastSeek(date){
			function testIt(){
				if(+masterData[mIterator].DT==+date) return 0;
				if(masterData[mIterator].DT<date) return 1;
				if(masterData[mIterator-1].DT>date) return -1;
				if(+masterData[mIterator-1].DT==+date) mIterator--;  // efficiency
				return 0;
			}
			var begin=mIterator, end=masterData.length-1;
			if(masterData[end].DT<date){
				mIterator=end+1;
				return;
			}else if(+masterData[end].DT==+date){
				mIterator=end;
				return;
			}
			mIterator++;
			var attempts=0;
			while(++attempts<100){
				switch(testIt()){
				case 0:
					return;
				case 1:
					begin=mIterator;
					break;
				case -1:
					end=mIterator;
					break;
				}
				mIterator=Math.round((end+begin)/2);
			}
			if(attempts>=100){
				console.log("!!!Warning: addMemberToMasterdata() did not find insertion point.");
				mIterator=masterData.length-1;
			}
		}

		// insert/update up to masterData last bar
		while(data && mIterator<masterData.length && cIterator<data.length){
			c=data[cIterator];
			m=masterData[mIterator];
			if(!c.DT || typeof c.DT=="undefined")
				c.DT=CIQ.strToDateTime(c.Date);
			else {
				if (typeof c.DT == "number") c.DT=new Date(c.DT); //in case they sent in an epoch
				if(!c.Date || c.Date.length!=17) c.Date=CIQ.yyyymmddhhmmssmmm(c.DT);
			}
			if(cIterator===0) {
				for(var s1=0;s1<series.length;s1++){
					if(!series[s1].endPoints.begin || series[s1].endPoints.begin>c.DT) series[s1].endPoints.begin=c.DT;
				}
			}
			if(+c.DT==+m.DT){
				injectData(m,c);
				cIterator++;
				mIterator++;
				continue;
			}

			if(c.DT<m.DT) {
				masterData.splice(mIterator,0,{DT: c.DT,Date: c.Date});
				continue;
			}
			else fastSeek(c.DT);  // this advances the mIterator
		}

		// insert after master data last bar
		if(mIterator>=masterData.length){
			while(data && cIterator<data.length){
				c=data[cIterator];
				if(!c.DT || typeof c.DT=="undefined")
					c.DT=CIQ.strToDateTime(c.Date);
				else {
					if (typeof c.DT == "number") c.DT=new Date(c.DT); //in case they sent in an epoch
					if(!c.Date || c.Date.length!=17) c.Date=CIQ.yyyymmddhhmmssmmm(c.DT);
				}
				m =  {
					DT: c.DT,
					Date: c.Date
				};
				injectData(m,c);
				masterData.push(m);
				cIterator++;
			}
		}
		if(params.fillGaps && masterData.length){
			var cleanupGapsParams={noCleanupDates:true, cleanupGaps:params.fillGaps};
			if(fields){
				for(var j=0;j<fields.length;j++){
					cleanupGapsParams.field=fields[j];
					stx.doCleanupGaps(masterData, chart, cleanupGapsParams);
				}
			}else{
				cleanupGapsParams.field=label;
				stx.doCleanupGaps(masterData, chart, cleanupGapsParams);
			}
		}
		for(var s2=0;s2<series.length;s2++){
			if(!series[s2].endPoints.end || series[s2].endPoints.end<=m[label].DT){
				series[s2].lastQuote=m[label];
				series[s2].endPoints.end=m[label].DT;
			}
		}
		stx.setMasterData(masterData, chart, {noCleanupDates:true});
	};

	/**
	 * Generates an object that can be used programmatically to load new themes or to create a theme dialog to manage chart themes.
	 * The initial values contain the existing values in the current chart.
	 * Simply have your dialog modify these values and then call the method {@link CIQ.ThemeHelper#update}
	 *
	 * Note that the chart has many granular customizations beyond what this theme helper produces.
	 * This helper simplifies and consolidates into a manageable set.
	 * For example 'hallow candles', 'bars' and 'candles' colors are all grouped together.
	 * But if you need to separate those out, just call an explicit {@link CIQ.ChartEngine#setStyle} for each CSS style right after the ThemeHelper is executed.
	 * 
	 * For example, This will further set the color for the hollow_candle chart type:
	 * ```
	 * stxx.setStyle("stx_hollow_candle_down","color",'blue');
	 * stxx.setStyle("stx_hollow_candle_up","color",'yellow');
	 * stxx.setStyle("stx_hollow_candle_even","color",'pink');
	 * stxx.draw();
	 * ```
	 * See {@tutorial Chart Styles and Types} for more details.
	 *
	 * Generally speaking, themes can be managed by simply adding or removing from the chart context the class name that groups the theme together.
	 * And as long as the CSS contains an entry for that class, the chart will display the styles in the class when enabled.
	 *
	 * For example, assume the chart has a default theme and a second theme called 'ciq-night'.
	 * Here are some examples of what CSS entries for those classes would look like:
	 * ```
	 * // default theme (day) styles
	 * .stx_candle_shadow, .stx_bar_even {
	 * 		color:#2e383b;
	 *
	 * }
	 * .stx_candle_down, .stx_line_down {
	 * 		border-left-color: #000000;
	 * }
	 *
	 * // night theme override styles
	 * .ciq-night .stx_candle_shadow, .ciq-night .stx_bar_even {
	 * 		color: #ccc;
	 * }
	 * .ciq-night .stx_candle_down, .ciq-night .stx_line_down {
	 * 		border-left-color: #e34621;
	 * }
	 * ```
	 *
	 * Then to activate a particular theme, you either remove the specific class to enable default (day):
	 * ```
	 * $("cq-context").removeClass('ciq-night');
	 * // clear out the old styles to allow new ones to be cached in; and redraw.
	 * stxx.styles={};stxx.draw();
	 * ```
	 * Or add a particular class to enable those styles:
	 * ```
	 * $("cq-context").addClass('ciq-night');
	 * // clear out the old styles to allow new ones to be cached in; and redraw.
	 * stxx.styles={};stxx.draw();
	 * ```
	 * You can use this method to set as many themes as needed. Remember that this method, requires all styles to be present in the CSS.
	 * ThemeHelper, on the other hand, will programmatically set the styles internally, one at a time, regardless of pre-existng CSS classes.
	 *
	 * @param {object} params Parameters
	 * @param {CIQ.ChartEngine} params.stx A chart object
	 * @constructor
	 * @name  CIQ.ThemeHelper
	 * @example
	 * var helper=new CIQ.ThemeHelper({stx:stx});
	 * console.log(helper.settings);
	 * helper.settings.chart["Grid Lines"].color="rgba(255,0,0,.5)";
	 * helper.update();
	 * 
	 * @since 6.2.0 Added support to control Mountain.basecolor.
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
		this.settings.chartTypes["Candle/Bar"].even.wick=CIQ.hexToRgba(stx.canvasStyle("stx_candle_shadow_even").color);
		this.settings.chartTypes["Candle/Bar"].up.border=CIQ.hexToRgba(stx.canvasStyle("stx_candle_up").borderLeftColor);
		this.settings.chartTypes["Candle/Bar"].down.border=CIQ.hexToRgba(stx.canvasStyle("stx_candle_down").borderLeftColor);
		if(CIQ.isTransparent(stx.canvasStyle("stx_candle_up").borderLeftColor)) this.settings.chartTypes["Candle/Bar"].up.border=null;
		if(CIQ.isTransparent(stx.canvasStyle("stx_candle_down").borderLeftColor)) this.settings.chartTypes["Candle/Bar"].down.border=null;

		this.settings.chartTypes.Line.color=CIQ.hexToRgba(stx.canvasStyle("stx_line_chart").color);

		this.settings.chartTypes.Mountain.color=CIQ.hexToRgba(stx.canvasStyle("stx_mountain_chart").backgroundColor);
		this.settings.chartTypes.Mountain.basecolor=CIQ.hexToRgba(stx.canvasStyle("stx_mountain_chart").color);
	};

	/**
	 * Current theme settings. These are the settings that are ready to be loaded, or currently loaded.
	 * Modify as needed.
	 * To load these settings call {@link CIQ.ThemeHelper#update}
	 * @example
	 * //Default settings object structure
	 * 	"chart":{
			"Background":{
				"color":color1
			},
			"Grid Lines":{
				"color":color2
			},
			"Grid Dividers":{
				"color":color3
			},
			"Axis Text":{
				"color":color4
			}
		},
		"chartTypes":{
			"Candle/Bar":{ // also manages 'hollow candle', 'colored line' and 'colored baseline' chart types.
				"up":{
					"color":color5,
					"wick":color6,
					"border":color7
				},
				"down":{
					"color":color8,
					"wick":color9,
					"border":color10
				},
				"even":{
					"color":null,
					"wick":null,
					"border":null
				}
			},
			"Line":{
				"color":color11
			},
			"Mountain":{
				"color":color12,
				"basecolor":color13
			}
		}
	 * @memberof CIQ.ThemeHelper
	 * @type object
	 */
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
				},
				"even":{
					"color":null,
					"wick":null,
					"border":null
				}
			},
			"Line":{
				"color":null
			},
			"Mountain":{
				"color":null,
				"basecolor":null
			}
		}
	};

	/**
	 * Call this method to activate the chart theme with values set in {@link CIQ.ThemeHelper#settings}
	 * @memberof CIQ.ThemeHelper
	 * @param {CIQ.ChartEngine} [stx] Chart engine to apply the changes to.
	 * @since  4.1.0 Added optional chart engine parameter.
	 * @example
	 * var helper=new CIQ.ThemeHelper({stx:stx});
	 * console.log(helper.settings);
	 * helper.settings=NewSettings;
	 * helper.update();
	 * @since 6.2.0 Now setting basecolor and color of mountain chart with separate colors.

	 */
	CIQ.ThemeHelper.prototype.update=function(stx){
		if(!stx) stx=this.params.stx;
		var classMapping={
			stx_candle_up: {stx_candle_up:true, stx_bar_up:true, stx_hollow_candle_up:true, stx_line_up:true, stx_baseline_up:true},
			stx_candle_down: {stx_candle_down:true, stx_bar_down:true, stx_hollow_candle_down:true ,stx_line_down:true, stx_baseline_down:true},
			stx_shadow_up: {stx_candle_shadow_up:true},
			stx_shadow_down: {stx_candle_shadow_down:true},
			stx_shadow_even: {stx_candle_shadow_even:true},
			stx_line_chart: {stx_bar_chart:true, stx_line_chart:true},
			stx_grid: {stx_grid:true},
			stx_grid_dark: {stx_grid_dark:true},
			stx_xaxis: {stx_xaxis_dark:true, stx_xaxis:true, stx_yaxis:true, stx_yaxis_dark:true, stx_grid_border: true},
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

		var candleBar = this.settings.chartTypes["Candle/Bar"];
		// backwards compatibility with pre-5.0.3 saved themes
		if(!candleBar.even) {
			candleBar.even = {
				"color": null,
				"wick": CIQ.hexToRgba(stx.canvasStyle("stx_candle_shadow_even").color),
				"border": null
			};
		}
		setStyle("stx_candle_up","color",candleBar.up.color);
		setStyle("stx_candle_down","color",candleBar.down.color);
		setStyle("stx_shadow_up","color",candleBar.up.wick);
		setStyle("stx_shadow_down","color",candleBar.down.wick);
		setStyle("stx_shadow_even","color",candleBar.even.wick);

		// Only apply borders to candle, not the other types
		stx.setStyle("stx_candle_up", "borderLeftColor", candleBar.up.border);
		stx.setStyle("stx_candle_down", "borderLeftColor", candleBar.down.border);

		setStyle("stx_line_chart","color",this.settings.chartTypes.Line.color);

		stx.setStyle("stx_mountain_chart","borderTopColor",CIQ.hexToRgba(this.settings.chartTypes.Mountain.color,1));
		stx.setStyle("stx_mountain_chart","backgroundColor",CIQ.hexToRgba(this.settings.chartTypes.Mountain.color,0.5));
		stx.setStyle("stx_mountain_chart","color",CIQ.hexToRgba(this.settings.chartTypes.Mountain.basecolor,0.01));
		stx.draw();
	};

	/**
	 * Base class for interacting with a name value store.
	 * This base class saves to local storage but you can override your own for remote storage,
	 * as long as you maintain the same function signatures and call back requirements.
	 *
	 * See {@link CIQ.UI.ViewsMenu} for implementatin example.
	 *
	 * @constructor
	 * @name  CIQ.NameValueStore
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
	 * @param  {string}   field The field to fetch
	 * @param  {Function} cb    Callback. First field is error or null. Second field is the result.
	 * @memberof CIQ.NameValueStore
	 * @example
	 * nameValueStore.get("myfield", function(err,data){
	 *    if(!err){
	 *        // do something with data
	 *        if(cb) cb(errorCode, yourViewObject);
	 *    }
	 * });
	 */
	CIQ.NameValueStore.prototype.get=function(field, cb){
		var value=CIQ.localStorage.getItem(field);
		if(cb) cb(null, this.fromJSONIfNecessary(value));
	};

	/**
	 * Set a value to the name value store
	 * @param  {string}   field The field to fetch
	 * @param  {string}   value The value to store
	 * @param  {Function} cb    Callback
	 * @memberof CIQ.NameValueStore
	 * @example
	 * nameValueStore.set("myfield", "myValue", function(){
	 *        // do something after data has been saved
	 *        if(cb) cb(errorCode);
	 *    }
	 * });
	 */
	CIQ.NameValueStore.prototype.set=function(field, value, cb){
		CIQ.localStorageSetItem(field, this.toJSONIfNecessary(value));
		if(cb) cb(null);
	};

	/**
	 * Remove a field from the name value store
	 * @param  {string}   field The field to remove
	 * @param  {Function} cb    Callback
	 * @memberof CIQ.NameValueStore
	 * @example
	 * nameValueStore.remove("myfield", function(){
	 *        // do something after data has been removed
	 *        if(cb) cb(errorCode);
	 *    }
	 * });
	 */
	CIQ.NameValueStore.prototype.remove=function(field, cb){
		CIQ.localStorage.removeItem(field);
		if(cb) cb(null);
	};

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

	CIQ.extend(CIQ.Plotter.prototype, {
		/**
		 * Define a series to plot. A series is a specific color and referenced by name
		 * @param {string} name         Name of series
		 * @param {boolean} strokeOrFill If true then a stroke operation, otherwise a fill operation
		 * @param {string} color        A valid canvas color
		 * @param {number} [opacity=1]      A valid opacity from 0-1
		 * @param {number} [width=1]      A valid lineWidth from 1
		 * @param {string} [pattern=solid]      A valid pattern (solid, dotted, dashed)
		 * @memberof CIQ.Plotter
		 * @since 4.0.0 added parameter pattern
		 */
			Series: function(name, strokeOrFill, color, opacity, width, pattern){
				this.name=name;
				this.strokeOrFill=strokeOrFill;
				this.color=color;
				this.moves=[];
				this.text=[];
				if(!opacity || opacity>1 || opacity<0) opacity=1;
				this.opacity=opacity;
				if(!width || width>25 || width<1) width=1;
				this.width=width;
				this.pattern=CIQ.borderPatternToArray(width,pattern);
			},
			/**
			 * Create a series. This supports either a text color or CIQ.ChartEngine.Style object
			 * @see  CIQ.Plotter.Series
			 * @memberof CIQ.Plotter
			 */
			newSeries: function(name, strokeOrFill, colorOrStyle, opacity, width){
				var series;
				if(colorOrStyle.constructor == String) series=new this.Series(name, strokeOrFill, colorOrStyle, opacity, width);
				else series=new this.Series(name, strokeOrFill, colorOrStyle.color, colorOrStyle.opacity, width, colorOrStyle.borderTopStyle);
				this.seriesArray.push(series);
				this.seriesMap[name]=series;
			},
			/**
			 * Clear out any moves or text stored in the plotter for series "name"
			 * @memberof CIQ.Plotter
			 * @param {string} name Name of series to reset.  If omitted, will reset all series in plotter.
			 * @since 3.0.0
			 */
			reset: function(name){
				for(var s in this.seriesMap){
					if(name && name!=s) continue;
					var series=this.seriesMap[s];
					if(series){
						series.moves=[];
						series.text=[];
					}
				}
			},
			/**
			 * @memberof CIQ.Plotter
			 */
			moveTo: function(name, x, y){
				var series=this.seriesMap[name];
				series.moves.push({"action":"moveTo","x":x,"y":y});
			},
			/**
			 * @memberof CIQ.Plotter
			 */
			lineTo: function(name, x, y){
				var series=this.seriesMap[name], pattern=series.pattern;
				series.moves.push({"action":"lineTo","x":x,"y":y, "pattern":pattern});
			},
			/**
			 * @memberof CIQ.Plotter
			 */
			dashedLineTo: function(name, x, y, pattern){
				var series=this.seriesMap[name];
				series.moves.push({"action":"lineTo","x":x,"y":y, "pattern":pattern});
			},
			/**
			 * @memberof CIQ.Plotter
			 */
			quadraticCurveTo: function(name, cx0, cy0, x, y){
				var series=this.seriesMap[name], pattern=series.pattern;
				series.moves.push({"action":"quadraticCurveTo","x0":cx0, "y0":cy0, "x":x, "y":y, "pattern":pattern});
			},
			/**
			 * @memberof CIQ.Plotter
			 * @since 4.0.0
			 */
			bezierCurveTo: function(name, cx0, cy0, cx1, cy1, x, y){
				var series=this.seriesMap[name], pattern=series.pattern;
				series.moves.push({"action":"bezierCurveTo","x0":cx0, "y0":cy0, "x1":cx1, "y1":cy1, "x":x, "y":y, "pattern":pattern});
			},
			/**
			 * Add text to be rendered with the drawing. Primarily used when the Plotter is used for caching since there is no
			 * performance benefit from batching text operations to the GPU. If specifying a bounding box, textBaseline="middle" is assumed
			 * @param {string} name Name of series
			 * @param {string} text The raw text to render
			 * @param {number} x    X position on canvas for text
			 * @param {number} y    Y position on canvas for text
			 * @param {string} [backgroundColor] Color to use on the box underneath the text
			 * @param {number} [width]  Width of bounding box
			 * @param {number} [height] Height of bounding box
			 * @memberof CIQ.Plotter
			 */
			addText: function(name, text, x, y, backgroundColor, width, height){
				var series=this.seriesMap[name];
				series.text.push({"text":text,"x":x,"y":y, "bg":backgroundColor});
			},
			/**
			 * Renders the text objects. This is done after drawing primitives for each series.
			 * @private
			 * @memberof CIQ.Plotter
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
							context.fillRect(textObj.x, textObj.y-(h/2), -w, -h);
						}else{
							context.fillRect(textObj.x, textObj.y-(h/2), w, h);
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
			 * @memberof CIQ.Plotter
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
					context.save();
					for(var j=0;j<series.moves.length;j++){
						var move=series.moves[j];
						if(move.pattern) {
							context.setLineDash(move.pattern);
							context.lineDashOffset=0;
						}
						else context.setLineDash([]);
						if(move.action=="quadraticCurveTo"){
							(context[move.action])(move.x0, move.y0, move.x, move.y);
						}else if(move.action=="bezierCurveTo"){
							(context[move.action])(move.x0, move.y0, move.x1, move.y1, move.x, move.y);
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
					context.restore();
					this.drawText(context, series);
					context.lineWidth=1;
				}
				context.lineWidth=prevWidth;
				context.fillStyle=prevFillStyle;
				context.strokeStyle=prevStrokeStyle;
				context.globalAlpha=prevGlobalAlpha;
			}
	}, true);

	/**
	 * A simple device to make ease functions easy to use. Requests a cubic function that takes the form function (t, b, c, d)
	 * 		t = current time
	 * 		b = starting value
	 * 		c = change in value
	 * 		d = duration
	 * @param {function} fc        The cubic function
	 * @param {number} ms         Milliseconds to perform the function
	 * @param {map} [startValues] Name value pairs of starting values (or pass in a single value)
	 * @param {map} [endValues]   Name value pairs of ending values (or pass in a single value)
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
	 * @param {map} [startValues] Name value pairs of starting values (or pass in a single value). If null then the currentValues will become the startValues (allowing for resetting or reversing of direction)
	 * @param {map} endValues   Name value pairs of ending values (or pass in a single value)
	 * @memberof CIQ.EaseMachine
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
	 * @return {map} Name value pairs of current values or current value
	 * @memberof CIQ.EaseMachine
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
	 * This will be false while the ease machine is completing
	 * @type {boolean}
	 * @memberof CIQ.EaseMachine
	 */
	CIQ.EaseMachine.prototype.hasCompleted=true;


	/**
	 * Runs the ease machine in a loop until completion by calling next() from within a requestAnimationFrame.
	 * @param {function} fc Function callback, will receive the results of {@link CIQ.EaseMachine#next}
	 * @param {map} [startValues] Name value pairs of starting values (or pass in a single value)
	 * @param {map} [endValues]   Name value pairs of ending values (or pass in a single value)
	 * @param {boolean} [delayFirstRun=false] Normally, the first pass of the run will happen immediately. Pass true if you want to wait for the next animation frame before beginning.
	 * @memberof CIQ.EaseMachine
	 */
	CIQ.EaseMachine.prototype.run=function(fc, startValues, endValues, delayFirstRun){
		if(this.afid) cancelAnimationFrame(this.afid);
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
		this.running=true;
		if(delayFirstRun)
			this.afid=requestAnimationFrame(go);
		else
			go();
	};

	/**
	 * Stops the ease machine from running mid-animation. Returns the current state.
	 * @return {map} Name value pairs of current values or current value
	 * @memberof CIQ.EaseMachine
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

	/**
	 * Base class for Renderers.
	 * A renderer is used to draw a complex visualization based on one or more "series" of data.
	 * Renderers only need to be attached to a chart once. You can change symbols and continue using the same renderer.
	 * The series associated with a renderer may change at any time, but the linked renderer itself remains the vehicle for display them.
	 *
	 * Series are associated with renderers by calling attachSeries().
	 * More typically though, this is done automatically when {@link CIQ.ChartEngine#addSeries} is used.
	 * The parameters for addSeries() are passed both to the renderer's constructor and also to attachSeries().
	 *
	 * To manually create a renderer use {@link CIQ.ChartEngine#setSeriesRenderer}
	 *
	 * @name  CIQ.Renderer
	 * @constructor
	 */
	CIQ.Renderer=function (){};

	/**
	 * Factory for renderer.  Will request a renderer from each renderer subclass until it is given one.
	 * @param  {string} chartType Chart type name (usually from layout.chartType)
	 * @param  {object} [params] Parameters to pass to the renderer constructor
	 * @memberof CIQ.Renderer
	 * @since 5.1.0
	 * @private
	 */
	CIQ.Renderer.produce=function(chartType, params){
		var renderer=null;
		if(chartType){
			for(var r in CIQ.Renderer){
				var rendererType=CIQ.Renderer[r];
				// Note: chartType has often been a combination of attributes connected with an underscore,
				// e.g. colored_bar, baseline_mountain.  So we split this legacy name to get the attributes.
				if(rendererType.requestNew) renderer=rendererType.requestNew(chartType.split("_"), params);
				if(renderer) return renderer;
			}
		}
		params.type="line";
		return new CIQ.Renderer.Lines({params:params});
	};

	CIQ.Renderer.colorFunctions={};
	/**
	 * Registers a colorFunction for use with a renderer.
	 * It is necessary to register a color function if you want the function to be tied back to an imported renderer.
	 * @param  {string} name The name of the registered function
	 * @param  {function} fc The function to register
	 * @memberof CIQ.Renderer
	 */
	CIQ.Renderer.registerColorFunction=function(name, funct){
		CIQ.Renderer.colorFunctions[name]=funct;
	};

	/**
	 * Unregisters a colorFunction for use with a renderer.
	 * @param  {string} name The name of the registered function
	 * @memberof CIQ.Renderer
	 */
	CIQ.Renderer.unregisterColorFunction=function(name){
		delete CIQ.Renderer.colorFunctions[name];
	};

	/**
	 * If your renderer manages a yAxis then the necessary calculations (high and low) should be made here
	 * @memberof CIQ.Renderer
	 * @deprecated Since 5.2.0. Use {@link CIQ.Renderer#adjustYAxis} instead.
	 */
	CIQ.Renderer.prototype.performCalculations=function(){};

	/**
	 * If your renderer manages a yAxis then the necessary adjustments to its properties should be made here
	 * @memberof CIQ.Renderer
	 * @since 5.2.0
	 */
	CIQ.Renderer.prototype.adjustYAxis=function(){};

	/**
	 * Perform drawing operations here.
	 * @memberof CIQ.Renderer
	 */
	CIQ.Renderer.prototype.draw=function(){};

	/**
	 * Draws one series from the renderer
	 * Called by {@link CIQ.ChartEngine#drawSeries}
	 * @param  {CIQ.ChartEngine.Chart} chart The chart object to draw the renderers upon
	 * @param {object} [parameters] Parameters used to draw the series, depends on the renderer type
	 * @param {string} [parameters.panel] Name of panel to draw the series upon
	 * @memberof CIQ.Renderer
	 * @since 5.1.0
	 */
	CIQ.Renderer.prototype.drawIndividualSeries=function(chart, parameters){};

	/**
	 * Default constructor for a renderer. Override this if desired.
	 * @param  {object} config Configuration for the renderer
	 * @param  {function} [config.callback] Callback function to perform activity post-drawing, for example, creating a legend. It will be called with a 'colors' argument, which will be an array of objects containing the colors used to draw the rendering. ( Example: cb(colors); ). See example for format.
	 * @param  {string} [config.id] Handle to access the rendering in the future.  If not provided, one will be generated.
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {string} [config.params.name="Data"] Name of the renderer. This is used when displaying error message on screen
	 * @param  {string} [config.params.panel="chart"] The name of the panel to put the rendering on.
	 * @param  {boolean} [config.params.overChart=true] If set to false, will draw the rendering behind the main chart rather than over it. By default rendering will be as overlay on the main chart.
	 * @param  {boolean} [config.params.yAxis] Y-axis object to use for the series.
	 * @param  {number} [config.params.opacity=1] Opacity of the rendering as a whole.  Can be overridden by an opacity set for a series.  Valid values are 0.0-1.0.
	 * @param  {object} [config.params.binding] Allows the use of the study output colors within the renderer. See an example in the [Using Renderers to Display Study Output](tutorial-Using and Customizing Studies.html#Using Renderers to Display Study Output) section of the Studies tutorial.
	 * @memberof CIQ.Renderer
	 * @since 5.2.0  `config.params.binding` parameter added.
	 * @example
	 *	// add multiple series and attach to a custom y-axis on the left.
	 *	// See this example working here : https://jsfiddle.net/chartiq/b6pkzrad
	 *
	 *	// note how the addSeries callback is used to ensure the data is present before the series is displayed
	 *
	 *	//create the custom axis
	 *	var axis=new CIQ.ChartEngine.YAxis();
	 *	axis.position="left";
	 *	axis.textStyle="#FFBE00";
	 *	axis.decimalPlaces=0;			// no decimal places on the axis labels
	 *	axis.maxDecimalPlaces=0;		// no decimal places on the last price pointer
	 *
	 *	//create the renderer
	 *	var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", yAxis:axis}}));
	 *
	 *	// create your series and attach them to the chart when the data is loaded.
	 *	stxx.addSeries("NOK", {display:"NOK",width:4},function(){
	 *		renderer.attachSeries("NOK", "#FFBE00").ready();
	 *	});
	 *
	 *	stxx.addSeries("SNE", {display:"Sony",width:4},function(){
	 *		renderer.attachSeries("SNE", "#FF9300").ready();
	 *	});
	 */
	CIQ.Renderer.prototype.construct=function(config){
		if(!config) config={};
		var params=config.params?config.params:{};
		if(!params.name) params.name=CIQ.uniqueID();
		if(!params.heightPercentage) params.heightPercentage=0.7;
		if(!params.opacity) params.opacity=1;
		if(params.highlightable!==false) params.highlightable=true;
		if(!params.panel) params.panel="chart";
		this.cb=config.callback;
		this.params=params;
		this.seriesParams=[];
		this.caches={};
		this.colors={};
	};

	/**
	 * Attach a series to the renderer.
	 * This assumes that the series data *is already in the dataSet* and simply connects it to the renderer with the specified parameters.
	 * See {@link CIQ.ChartEngine#addSeries} for details on how to create a series.
	 *
	 * Any parameters defined when attaching a series, such as colors, will supersede any defined when a series was created. This allows you to attach the same series to multiple renderers, each rendering displaying the same series data in a different color, for example.
	 *
	 * @param  {string} id      The name of the series.
	 * @param  {object} parameters Settings to control color and opacity of <B>each</B> series in the group. See {@link CIQ.ChartEngine#addSeries} for implementation examples. <P>Argument format can be:<ul><li> a `string` containing the color</li><li> or a more granular `object` having the following members:</li></ul>
	 * @param  {string} [parameters.field] The name of the field. Name of the field in the dataSet to use for the series.  If omitted, defaults to id
	 * @param  {string} [parameters.fill_color_up] Color to use to fill the part when the Close is higher than the previous (or 'transparent' to not display)
	 * @param  {string} [parameters.border_color_up] Color to use to draw the border when the Close is higher than the previous (or 'transparent' to not display)
	 * @param  {number} [parameters.opacity_up=.4] Opacity to use to fill the part when the Close is higher than the previous (0.0-1.0)
	 * @param  {string} [parameters.border_color_even] Color to use to draw the border when the Close is equal to the previous (or 'transparent' to not display)
	 * @param  {string} [parameters.fill_color_down] Color to use to fill the part when the Close is lower than the previous (or 'transparent' to not display)
	 * @param  {string} [parameters.border_color_down] Color to use to draw the border when the Close is lower than the previous (or 'transparent' to not display)
	 * @param  {number} [parameters.opacity_down=.4] Opacity to use to fill the part when the Close is lower than the previous (0.0-1.0)
	 * @param  {string} [parameters.color] Color to use to fill the series in the absence of specific up/down color.
	 * @param  {string} [parameters.border_color] Color to use to draw the border in the series in the absence of specific up/down color.
	 * @param  {string} [parameters.fillStyle] Color to use to fill the mountain chart.
	 * @param  {string} [parameters.baseColor] Color to use at the bottom of the mountain chart, will create a gradient with bgColor
	 * @param  {string} [parameters.bgColor] Color to use at the top of the mountain chart, will create a gradient if baseColor is specified.  Otherwise, will fill the mountain solid with this color unless fillStyle is specified
	 * @param  {boolean} [parameters.permanent] Whether the attached series can be removed by the user (lines and bars only). By default the series will not be permanent. This flag (including the default) will supersede the permanent flag of the actual series. As such, a series will not be permanent unless you set this flag to 'true', even if the series being attached was flaged set as permanent when defined. This gives the renderer most control over the rendering process.
	 * @return {CIQ.Renderer}            Returns a copy of this for chaining
	 * @since 5.1.0 added fillStyle, baseColor, bgColor parameters
	 * @memberof CIQ.Renderer
	 * @example
	 *	// add multiple series and attach to a custom y-axis on the left.
	 *	// See this example working here : https://jsfiddle.net/chartiq/b6pkzrad
	 *
	 *	// note how the addSeries callback is used to ensure the data is present before the series is displayed
	 *
	 *	//create the custom axis
	 *	var axis=new CIQ.ChartEngine.YAxis();
	 *	axis.position="left";
	 *	axis.textStyle="#FFBE00";
	 *	axis.decimalPlaces=0;			// no decimal places on the axis labels
	 *	axis.maxDecimalPlaces=0;		// no decimal places on the last price pointer
	 *
	 *	//create the renderer
	 *	var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", yAxis:axis}}));
	 *
	 *	// create your series and attach them to the chart when the data is loaded.
	 *	stxx.addSeries("NOK", {display:"NOK",width:4},function(){
	 *		renderer.attachSeries("NOK", "#FFBE00").ready();
	 *	});
	 *
	 *	stxx.addSeries("SNE", {display:"Sony",width:4},function(){
	 *		renderer.attachSeries("SNE", "#FF9300").ready();
	 *	});
	 */
	CIQ.Renderer.prototype.attachSeries=function(id, parameters){
		var stx=this.stx;
		if(!stx) return this;
		var series=this.stx.chart.series[id];
		if(!series) series={parameters:{}};
		var rParams=this.params, sParams=series.parameters;
		var sp={
			id: 				id,
			chartType:			rParams.type,
			display: 			series.parameters.display,
			border_color_up:	rParams.defaultBorders?"auto":null,
			fill_color_up:		series.parameters.color,
			opacity_up:			rParams.opacity,
			border_color_down:	rParams.defaultBorders?"auto":null,
			fill_color_down:	series.parameters.color,
			opacity_down:		rParams.opacity,
			color:				series.parameters.color,
			symbol:				series.parameters.symbol,
			symbolObject:		CIQ.clone(series.parameters.symbolObject)
		};
		if(typeof parameters=="string"){
			sp.color=sp.fill_color_down=sp.fill_color_up=parameters;
		}else if(typeof parameters=="object"){
			for(var p in parameters) sp[p]=parameters[p];
			var c=sp.color, bc=sp.border_color;
			if(c){
				if(!sp.fill_color_up) sp.fill_color_up=c;
				if(!sp.fill_color_down) sp.fill_color_down=c;
				if(!sp.fill_color_even) sp.fill_color_even=c;
			}
			if(bc){
				if(!sp.border_color_up) sp.border_color_up=bc;
				if(!sp.border_color_down) sp.border_color_down=bc;
				if(!sp.border_color_even) sp.border_color_even=bc;
			}
		}
		if(sp.symbol && sp.field!=sp.symbol) {
			sp.subField=sp.field;
			sp.field=sp.symbol;
		}
		//if(!sp.symbol && !sp.field && !this.highLowBars) sp.field="Close";
		if(!sp.id) sp.id=CIQ.uniqueID();

		var i = 0;
		for (; i < this.seriesParams.length; ++i) {
			if (this.seriesParams[i].id === sp.id) {
				this.removeSeries(sp.id, true);
				break;
			}
		}
		this.seriesParams.splice(i, 0, sp);

		if(sp.fill_color_up!=sp.fill_color_down){
			this.colors[id+" up"]={"color":sp.fill_color_up,"opacity":sp.opacity_up,"display":sp.display?sp.display+" up":id+" up"};
			this.colors[id+" dn"]={"color":sp.fill_color_down,"opacity":sp.opacity_down,"display":sp.display?sp.display+" down":id+" down"};
		}else{
			this.colors[id]={"color":sp.fill_color_up,"opacity":sp.opacity_up,"display":sp.display?sp.display:id};
		}
		if(rParams.yAxis){
			rParams.yAxis=stx.addYAxis(stx.panels[rParams.panel], rParams.yAxis);
			rParams.yAxis.needsInitialPadding=true;
		}
    	return this;
	};

	/**
	 * Removes a series from the renderer. The yAxis and actual series data will also be removed if no longer used by any other renderers.
	 * When the last series is removed from the renderer, the chart it is attached to will remove the renderer.
	 * Will [reset comparisons]{@link CIQ.ChartEngine#setComparison} if there are no more comparisons on the chart if {@link CIQ.ChartEngine.Chart#forcePercentComparison} is true.
	 * @param  {string} id          The field name of the series.
	 * @param  {boolean} [preserveSeries=false] Set to true to keep the series data in the CIQ.ChartEngine object.
	 * @return {CIQ.Renderer}                A copy of this for chaining
	 * @memberof CIQ.Renderer
	 * @since
	 * <br>&bull; 2015-07-01 'preserveSeries' is now available
	 * <br>&bull; 3.0.0 series is now removed even if series parameter 'permanent' is set to true. The permanent parameter only prevents right click user interaction and not programmatically requested removals.
	 * <br>&bull; 4.0.0 series data is now totally removed from masterData if no longer used by any other renderers.
	 * <br>&bull; 6.2.0 No longer force 'percent'/'linear', when adding/removing comparison series, respectively, unless {@link CIQ.ChartEngine.Chart#forcePercentComparison} is true. This allows for backwards compatibility with previous UI modules.
	 */
	CIQ.Renderer.prototype.removeSeries=function(id, preserveSeries){
		var spliceIndex=null,comparing=false;
		for(var sp=0;sp<this.seriesParams.length;sp++){
			var seriesParams=this.seriesParams[sp];
			if(seriesParams.id==id) spliceIndex=sp;
			else if(seriesParams.isComparison) comparing=true;
		}
		if(spliceIndex!==null) this.seriesParams.splice(spliceIndex,1);
		var chart=this.stx.chart;
		if(!comparing && chart.forcePercentComparison && this.params.panel==chart.panel.name && (!this.params.yAxis || this.params.yAxis==chart.yAxis))
			this.stx.setChartScale();

		delete this.colors[id+" up"];
		delete this.colors[id+" dn"];
		delete this.colors[id];

		if(!preserveSeries){
			//if(!this.stx.chart.series[id] || !this.stx.chart.series[id].parameters.permanent){
				var seriesInUse=false;
				for(var plot in chart.seriesRenderers){
					var myPlot=chart.seriesRenderers[plot];
					for(var s=0;s<myPlot.seriesParams.length;s++){
						if(myPlot.seriesParams[s].id==id) {
							seriesInUse=true;
							break;
						}
					}
					if(seriesInUse) break;
				}
				if(!seriesInUse) {
					this.stx.deleteSeries(id, this.stx.chart);
				}
			//}
		}
		this.stx.deleteYAxisIfUnused(this.stx.panels[this.params.panel], this.params.yAxis);
		return this;
	};

	/**
	 * Removes all series from the renderer and the yAxis from the panel if it is not being used by any current renderers.
	 * @param {boolean} [eraseData=false] Set to true to erase the actual series data in the CIQ.ChartEngine otherwise it will be retained
	 * @return {CIQ.Renderer} A copy of this for chaining
	 * @memberof CIQ.Renderer
	 */
	CIQ.Renderer.prototype.removeAllSeries=function(eraseData){
		if(eraseData){
			var arr=[];
			// Compile a list of all of the fields
    		for(var sp=0;sp<this.seriesParams.length;sp++){
    			arr.push(this.seriesParams[sp].id);
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
	 * @memberof CIQ.Renderer
	 */
	CIQ.Renderer.prototype.ready=function(){
		this.stx.createDataSet();
		this.stx.draw();
		return this;
	};

	/**
	 * Creates a Lines renderer. 
	 * 
	 * This renderer will draw lines of various color, thickness and pattern on a chart.
	 *
	 * The Lines renderer is used to create the following drawing types: line, mountain, baseline, wave, step chart, and colored versions of these.
	 * Note: by default the renderer will display lines as underlays. As such, they will appear below any other studies or drawings.
	 *
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {number} [config.params.width] Width of the rendered line
	 * @param  {string} [config.params.type="line"] Type of rendering "line", "mountain", ["wave"]{@link CIQ.ChartEngine#drawWaveChart}
	 * @param  {boolean} [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See {@link CIQ.ChartEngine.Chart#legendRenderer};
	 * @param  {boolean} [config.params.highlightable=true] Set to false to prevent selection of series via hover
	 * @param  {string} [config.params.style] Style name to use in lieu of defaults for the type
	 * @param  {boolean} [config.params.step] Specifies a step chart
	 * @param  {boolean} [config.params.baseline] Specifies a baseline chart
	 * @param  {boolean} [config.params.colored] Specifies the use of a colorFunction to dictate color of the segment
	 * @param  {boolean} [config.params.vertex] Specifies drawing a dot on every vertex
	 * @param  {boolean} [config.params.vertex_color] Specifies a color for the vertices.  If omitted, will use defaultColor.
	 * @param  {string} [config.params.colorFunction] Override string (or function) used to determine color of bar.  May be an actual function or a string name of the registered function (see {@link CIQ.Renderer.registerColorFunction})
	 *
	 * Common valid parameters for use by attachSeries. See also {@link CIQ.ChartEngine#plotLine}:<br>
	 * `color` - Specify the color for the line in rgba, hex or by name.<br>
	 * `pattern` - Specify the pattern as an array. For instance [5,5] would be five pixels and then five empty pixels.<br>
	 * `width` - Specify the width of the line.<br>
	 * `baseColor` - Specify the color of the base of a mountain.<br>
	 * `fillStyle` - Specify an alternate color to fill a mountain (other than `color`).<br>
	 *
	 * @constructor
	 * @name  CIQ.Renderer.Lines
	 * @since
	 * <br>&bull; 4.0.0 - New `config.params.useChartLegend` added
	 * <br>&bull; 5.1.0 removed subtype parameter, this will be determined internally from config.params.step=true
	 * <br>&bull; 5.1.0 added highlightable, overChart, step, baseline, vertex, style, colored, and colorFunction parameters
	 *
	 * @example
	 *	// add multiple series and attach to a custom y-axis on the left.
	 *	// See this example working here : https://jsfiddle.net/chartiq/b6pkzrad
	 *
	 *	// note how the addSeries callback is used to ensure the data is present before the series is displayed
	 *
	 *	//create the custom axis
	 *	var axis=new CIQ.ChartEngine.YAxis();
	 *	axis.position="left";
	 *	axis.textStyle="#FFBE00";
	 *	axis.decimalPlaces=0;			// no decimal places on the axis labels
	 *	axis.maxDecimalPlaces=0;		// no decimal places on the last price pointer
	 *
	 *	//create the renderer
	 *	var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", yAxis:axis}}));
	 *
	 *	// create your series and attach them to the chart when the data is loaded.
	 *	stxx.addSeries("NOK", {display:"NOK",width:4},function(){
	 *		renderer.attachSeries("NOK", "#FFBE00").ready();
	 *	});
	 *
	 *	stxx.addSeries("SNE", {display:"Sony",width:4},function(){
	 *		renderer.attachSeries("SNE", "#FF9300").ready();
	 *	});
	 *
	 * @example
		// This is an example on how completely remove a renderer and all associated data.
		// This should only be necessary if you are also removing the chart itself.

		// remove all series from the renderer including series data from the masterData
  		renderer.removeAllSeries(true);

  		// detach the series renderer from the chart.
  		stxx.removeSeriesRenderer(renderer);

  		// delete the renderer itself.
  		renderer=null;
	 *
	 * @example
	 	// Colored step baseline mountain with vertices
		var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", baseline:true, step:true, colored:true, vertex:true, yAxis:axis}}));
	 *
	 */
	CIQ.Renderer.Lines=function(config){
		this.construct(config);
		var params=this.params;
		if(!params.type) params.type="line";
		if(!params.style){
			switch (params.type){
			case "mountain":
				if(params.baseline) params.style="stx_baseline_delta_mountain";
				else if(params.colored) params.style="stx_colored_mountain_chart";
				else params.style="stx_mountain_chart";
				break;
			default:
				params.style="stx_line_chart";
			}
		}
		this.supportsAnimation=true;
		if(params.type=="wave"){  // wave charts don't support these options and no gap support either.
			params.step=params.vertex=params.baseline=params.colored=false;
			this.highLowBars=this.barsHaveWidth=true;
			this.supportsAnimation=false;
		}
		else if(params.type=="step"){
			params.step=true;
		}
	};
	CIQ.Renderer.Lines.ciqInheritsFrom(CIQ.Renderer, false);

	/**
	 * Returns a new Lines renderer if the featureList calls for it
	 * FeatureList should contain whatever features requested; valid features:
	 * 	line, mountain, baseline (delta), step, vertex, colored, wave
	 * Anything else is an invalid feature and will cause function to return null
	 * Called by {@link CIQ.Renderer.produce} to create a renderer for the main series
	 * @param {array} featureList List of rendering terms requested by the user, parsed from the chartType
	 * @param {object} [config.params] Parameters used for the series to be created, used to create the renderer
	 * @return {CIQ.Renderer.Lines} A new instance of the Lines renderer, if the featureList matches
	 * @memberof CIQ.Renderer.Lines
	 * @since 5.1.0
	 */
	CIQ.Renderer.Lines.requestNew=function(featureList, params){
		var type=null, isStep=params.step, isColored=params.colored, isBaseline=params.baseline, isVertex=params.vertex;
		for(var pt=0;pt<featureList.length;pt++){
			var pType=featureList[pt];
			switch (pType){
			case "line":
			case "mountain":
			case "wave":
				type=pType;
				break;
			case "baseline":
				isBaseline=true;
				break;
			case "colored":
				isColored=true;
				break;
			case "step":
				isStep=true;
				break;
			case "vertex":
				isVertex=true;
				break;
			case "delta":
				break;
			default:
				return null;  // invalid chart type for this renderer
			}
		}
		if(type===null && !isBaseline && !isStep) return null;

		return new CIQ.Renderer.Lines({
			params:CIQ.extend(params,{type:type, step:isStep, colored:isColored, baseline:isBaseline, vertex:isVertex})
		});
	};

	CIQ.Renderer.Lines.prototype.draw=function(){
		var stx=this.stx, panel=this.stx.panels[this.params.panel], chart=panel.chart;
		var seriesMap={};
		var s, seriesParams=this.seriesParams;
		var colorFunction=this.params.colorFunction;
		function defaultColorFunction(param){
			var stxLineUpColor=param.fill_color_up || stx.getCanvasColor("stx_line_up");
			var stxLineDownColor=param.fill_color_down || stx.getCanvasColor("stx_line_down");
			var stxLineColor=param.color || stx.getCanvasColor("stx_line_chart");
			return function(stx, quote, mode){
				if(!quote.iqPrevClose && quote.iqPrevClose!==0) return stxLineColor;
				if(quote.Close>quote.iqPrevClose) return stxLineUpColor;
				if(quote.Close<quote.iqPrevClose) return stxLineDownColor;
				return stxLineColor;
			};
		}
		if(this.params.vertex && !stx.scatter){
			console.warn("Error, vertex option requires customChart.js");
			this.params.vertex=false;
		}
		for(s=0;s<seriesParams.length;s++){
			var sParam=seriesParams[s];
			if(this.params.colored){
				var parts=["_color_up","_color_down","_color"];
				for(var i=0;i<parts.length;i++){
					//if(!sParam["fill"+parts[i]]){
						var b=sParam["border"+parts[i]];
						if(b && b!="auto") sParam["fill"+parts[i]]=b;
					//}
				}
				if(!colorFunction) colorFunction=defaultColorFunction(sParam);
				this.params.colorFunction=colorFunction;
			}
			var defaultParams={};
			if(chart.series[sParam.id]) { // make sure the series is still there.
				defaultParams=CIQ.clone(chart.series[sParam.id].parameters);
			}
			seriesMap[sParam.id]={
				parameters: CIQ.extend(CIQ.extend(defaultParams,this.params),sParam),
				yValueCache: this.caches[sParam.id]
			};
			if(this==stx.mainSeriesRenderer && chart.customChart && chart.customChart.colorFunction){
				seriesMap[sParam.id].parameters.colorFunction=chart.customChart.colorFunction;
			}
		}
		stx.drawSeries(chart, seriesMap, this.params.yAxis, this);
		for(s in seriesMap){
			this.caches[s]=seriesMap[s].yValueCache;
		}
	};

	CIQ.Renderer.Lines.prototype.drawIndividualSeries=function(chart, parameters){
		if(parameters.invalid) return;
		var stx=this.stx, context=chart.context, rc=null;
		var colorFunction=parameters.colorFunction, panel=stx.panels[parameters.panel]||chart.panel;
		if(typeof(colorFunction)=="string") {
			colorFunction=CIQ.Renderer.colorFunctions[colorFunction];
			if(!colorFunction) return;
		}

		if(parameters.vertex){
			context.save();
			context.lineJoin="bevel";
		}
		if(parameters.type=="wave"){
			rc=stx.drawWaveChart(panel, parameters);
		}else if(parameters.baseline){
			rc=stx.drawBaselineChart(panel, parameters);
		}else if(parameters.type=="mountain"){
			parameters.returnObject=true;
			rc=stx.drawMountainChart(panel, parameters, colorFunction);
		}else{
			parameters.returnObject=true;
			rc=stx.drawLineChart(panel, parameters.style, colorFunction, parameters);
		}
		if(parameters.vertex){
			stx.scatter(panel,{
				yAxis: parameters.yAxis,
				field: parameters.symbol || parameters.field,
				subField: parameters.subField,
				symbol: parameters.symbol,
				color: parameters.vertex_color,
				overlayScaling: parameters.overlayScaling
			});
			context.restore();
		}
		return rc;
	};

	/**
	 * Creates an OHLC renderer.
	 *
	 * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
	 *
	 * The OHLC renderer is a base class for creating the following chart types: 
	 * - {@link CIQ.Renderer.HLC}
	 * - {@link CIQ.Renderer.Bars}
	 * - {@link CIQ.Renderer.Candles}
	 * - {@link CIQ.Renderer.SimpleHistogram}
	 * <br>and is normally not directly accessed.
	 *
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {string} [config.params.type] Type of rendering "bar", "candle". Not needed if `params.histogram` is set)
	 * @param  {boolean} [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See {@link CIQ.ChartEngine.Chart#legendRenderer};
	 * @param  {string} [config.params.style] Style name to use in lieu of defaults for the type
	 * @param  {boolean} [config.params.colored] For bar or hlc, specifies using a condition or colorFunction to determine color
	 * @param  {boolean} [config.params.hollow] Specifies candles should be hollow candles
	 * @param  {boolean} [config.params.volume] Specifies candles should be volume candles
	 * @param  {boolean} [config.params.histogram] Specifies histogram chart (if set, `params.type` is not required). These are basic histograms that allow just one bar per tick; not to be confused with stackable histograms which require the more advanced {@link CIQ.Renderer.Histogram}
	 * @param  {boolean} [config.params.hlc] Specifies bar chart, with just hlc data; no open tick
	 * @param  {boolean} [config.params.gradient=true] Specifies histogram bars are to be drawn with a gradient; set to false to draw with solid colors
	 * @param  {string} [config.params.colorBasis="close"] For bar/hlc charts, will compute color based on whether current close is higher or lower than previous close.  Set to "open" to compute this off the open rather than yesterday's close.
	 * @param  {function} [config.params.colorFunction] Oerride function (or string) used to determine color of bar.  May be an actual function or a string name of the registered function (see {@link CIQ.Renderer.registerColorFunction})
	 * @constructor
	 * @name  CIQ.Renderer.OHLC
	 * @since 5.1.0
	 * @example
	 	// Colored hlc chart
		var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.OHLC({params:{name:"bars", type:"bar", hlc:true, colored:true}}));
	 *
	 */

	CIQ.Renderer.OHLC=function(config){
		this.construct(config);
		var params=this.params;
		if(!params.type) params.type="candle";
		this.highLowBars=this.barsHaveWidth=this.standaloneBars=true;
		if(params.histogram) {
			params.type="candle";
			this.highLowBars=false;
			params.volume=params.hollow=false;
		}
		if(params.type=="bar") params.volume=params.hollow=params.histogram=false;
		if(params.type=="candle") params.hlc=params.colored=false;
		if(params.volume) params.hollow=true;
	};
	CIQ.Renderer.OHLC.ciqInheritsFrom(CIQ.Renderer, false);

	/**
	 * Returns a new OHLC renderer if the featureList calls for it
	 * FeatureList should contain whatever features requested; valid features:
	 * 	bar, hlc, candle, colored, histogram, hollow, volume
	 * Anything else is an invalid feature and will cause function to return null
	 * Called by {@link CIQ.Renderer.produce} to create a renderer for the main series
	 * @param {array} featureList List of rendering terms requested by the user, parsed from the chartType
	 * @param {object} [config.params] Parameters used for the series to be created, used to create the renderer
	 * @return {CIQ.Renderer.OHLC} A new instance of the OHLC renderer, if the featureList matches
	 * @memberof CIQ.Renderer.OHLC
	 * @since 5.1.0
	 */
	CIQ.Renderer.OHLC.requestNew=function(featureList, params){
		var type=null, isHlc=params.hlc, isColored=params.colored, isHollow=params.hollow, isVolume=params.volume, histogram=params.histogram;
		for(var pt=0;pt<featureList.length;pt++){
			var pType=featureList[pt];
			switch(pType){
			case "bar":
			case "candle":
				type=pType;
				break;
			case "volume":
				isVolume=true;
				break;
			case "hollow":
				isHollow=true;
				break;
			case "colored":
				isColored=true;
				break;
			case "histogram":
				histogram=true;
				type="candle";
				break;
			case "hlc":
				isHlc=true;
				type="bar";
				break;
			default:
				return null;  // invalid chartType for this renderer
			}
		}
		if(type===null) return null;

		return new CIQ.Renderer.OHLC({
			params:CIQ.extend(params,{type:type, hlc:isHlc, colored:isColored, hollow:isHollow, volume:isVolume, histogram:histogram})
		});
	};

	CIQ.Renderer.OHLC.prototype.draw=function(){
		var stx=this.stx, panel=this.stx.panels[this.params.panel], chart=panel.chart;
		var seriesMap={};
		var s, seriesParams=this.seriesParams;
		for(s=0;s<seriesParams.length;s++){
			var sParam=seriesParams[s];

			var defaultParams={};
			if(chart.series[sParam.id]) { // make sure the series is still there.
				defaultParams=CIQ.clone(chart.series[sParam.id].parameters);
			}
			seriesMap[sParam.id]={
				parameters: CIQ.extend(CIQ.extend(defaultParams,this.params),sParam),
				//yValueCache: this.caches[sParam.id]
			};
			if(this==stx.mainSeriesRenderer && chart.customChart && chart.customChart.colorFunction){
				seriesMap[sParam.id].parameters.colorFunction=chart.customChart.colorFunction;
			}
		}
		stx.drawSeries(chart, seriesMap, this.params.yAxis, this);
		for(s in seriesMap){
			if(seriesMap[s].yValueCache) this.caches[s]=seriesMap[s].yValueCache;
		}
	};

	CIQ.Renderer.OHLC.prototype.getColor=function(stx, panel, style, isBorder, isGradient, overrideColor){
		var color=overrideColor || style.color;
		if(isBorder){
			color=overrideColor || style.borderLeftColor || style["border-left-color"];
			if(!color) return null;
		}
		if(!isGradient) return color;
		var top=stx.pixelFromTransformedValue(panel.chart.highValue, panel);
		if(isNaN(top)) top=0;	// 32 bit IE doesn't like large numbers
		var backgroundColor=style.backgroundColor;
		if(color && !CIQ.isTransparent(color)){
			var gradient=stx.chart.context.createLinearGradient(0,top,0,2*panel.yAxis.bottom-top);
			gradient.addColorStop(0, color);
			gradient.addColorStop(1, backgroundColor);
			return gradient;
		}
		return backgroundColor;
	};

	CIQ.Renderer.OHLC.prototype.drawIndividualSeries=function(chart, parameters){
		if(parameters.invalid) return;
		var stx=this.stx, context=chart.context;
		var colorFunction=parameters.colorFunction, panel=stx.panels[parameters.panel]||chart.panel;
		if(typeof(colorFunction)=="string") {
			colorFunction=CIQ.Renderer.colorFunctions[colorFunction];
			if(!colorFunction) return;
		}
		var noBorders=(stx.layout.candleWidth-chart.tmpWidth<=2 && chart.tmpWidth<=3);
		var CLOSEUP=1;		// today's close greater than yesterday's close
		var CLOSEDOWN=2;	// today's close less than yesterday's close
		var CLOSEEVEN=4;	// today's close the same as yesterday's close
		var CANDLEUP=8;		// today's close greater than today's open
		var CANDLEDOWN=16;	// today's close less than today's open
		var CANDLEEVEN=32;	// today's close equal to today's open
		if(!chart.state.chartType) chart.state.chartType={};
		var pass=chart.state.chartType.pass={};
		var colorUseOpen=stx.colorByCandleDirection;
		if(parameters.colorBasis) colorUseOpen=parameters.colorBasis=="open";
		var isHistogram=parameters.histogram, type=parameters.type, hollow=parameters.hollow;
		var noWicks=stx.noWicksOnCandles[type];
		stx.startClip(panel.name);
		var colors=null, rc={colors:[],cache:[]}, caches=[];
		if(colorFunction){
			var drawingParams={isHistogram:isHistogram, field:parameters.field, yAxis:parameters.yAxis, volume:parameters.volume, overlayScaling:parameters.overlayScaling, highlight: parameters.highlight};
			if(!isHistogram && type=="bar"){
				drawingParams.type=parameters.hlc?"hlc":"bar";
				rc=stx.drawBarChart(panel, "stx_bar_chart", colorFunction, drawingParams);
			}else{
				if(type=="candle" && !noWicks) stx.drawShadows(panel, colorFunction, drawingParams);
				rc=stx.drawCandles(panel, colorFunction, drawingParams);	 //all bars
				drawingParams.isOutline=true;
				if(hollow || !noBorders) stx.drawCandles(panel, colorFunction, drawingParams);  //all bar borders, if candlewidth is too small then don't draw the borders
			}
		}else{
			var isGradient=isHistogram && parameters.gradient!==false;
			var chartParts=[
				{type:"histogram",	drawType:"histogram",	style:"stx_histogram_up",		condition:CANDLEUP,				fill:"fill_color_up",	border:"border_color_up",						useColorInMap:true, useBorderStyleProp:true},
				{type:"histogram",	drawType:"histogram",	style:"stx_histogram_down",		condition:CANDLEDOWN,			fill:"fill_color_down",	border:"border_color_down",						useColorInMap:true, useBorderStyleProp:true},
				{type:"histogram",	drawType:"histogram",	style:"stx_histogram_even",		condition:CANDLEEVEN,			fill:"fill_color_even",	border:"border_color_even",	skipIfPass:true,	useColorInMap:true, useBorderStyleProp:true},
				{type:"bar",		drawType:"bar",			style:parameters.style||"stx_bar_chart",												border:"border_color",							useColorInMap:true},
				{type:"bar",		drawType:"bar",			style:"stx_bar_up",				condition:colorUseOpen?CANDLEUP:CLOSEUP,				border:"border_color_up",						useColorInMap:true},
				{type:"bar",		drawType:"bar",			style:"stx_bar_down",			condition:colorUseOpen?CANDLEDOWN:CLOSEDOWN,			border:"border_color_down",						useColorInMap:true},
				{type:"bar",		drawType:"bar",			style:"stx_bar_even",			condition:colorUseOpen?CANDLEEVEN:CLOSEEVEN,			border:"border_color_even",	skipIfPass:true,	useColorInMap:true},
				{type:"candle",		drawType:"shadow",		style:"stx_candle_shadow",																border:"border_color_up"},
				{type:"candle",		drawType:"shadow",		style:"stx_candle_shadow_up",	condition:CANDLEUP,										border:"border_color_up"},
				{type:"candle",		drawType:"shadow",		style:"stx_candle_shadow_down",	condition:CANDLEDOWN,									border:"border_color_down"},
				{type:"candle",		drawType:"shadow",		style:"stx_candle_shadow_even",	condition:CANDLEEVEN,									border:"border_color_even",	skipIfPass:true},
				{type:"candle",		drawType:"candle",		style:"stx_candle_up",			condition:CANDLEUP,				fill:"fill_color_up",	border:"border_color_up",						useColorInMap:true, useBorderStyleProp:true},
				{type:"candle",		drawType:"candle",		style:"stx_candle_down",		condition:CANDLEDOWN,			fill:"fill_color_down",	border:"border_color_down",						useColorInMap:true, useBorderStyleProp:true},
				{type:"hollow",		drawType:"shadow",		style:"stx_hollow_candle_up",	condition:CLOSEUP,										border:"border_color_up"},
				{type:"hollow",		drawType:"shadow",		style:"stx_hollow_candle_down",	condition:CLOSEDOWN,									border:"border_color_down"},
				{type:"hollow",		drawType:"shadow",		style:"stx_hollow_candle_even",	condition:CLOSEEVEN,									border:"border_color_even",	skipIfPass:true},
				{type:"hollow",		drawType:"candle",		style:"stx_hollow_candle_up",	condition:CLOSEUP|CANDLEDOWN,	fill:"fill_color_up",	border:"border_color_up",						useColorInMap:true},
				{type:"hollow",		drawType:"candle",		style:"stx_hollow_candle_down",	condition:CLOSEDOWN|CANDLEDOWN,	fill:"fill_color_down",	border:"border_color_down",						useColorInMap:true},
				{type:"hollow",		drawType:"candle",		style:"stx_hollow_candle_even",	condition:CLOSEEVEN|CANDLEDOWN,	fill:"fill_color_even",	border:"border_color_even",	skipIfPass:true,	useColorInMap:true},
				{type:"hollow",		drawType:"candle",		style:"stx_hollow_candle_up",	condition:CLOSEUP|CANDLEUP,		fill:"fill_color_up",	border:"border_color_up"},
				{type:"hollow",		drawType:"candle",		style:"stx_hollow_candle_down",	condition:CLOSEDOWN|CANDLEUP,	fill:"fill_color_down",	border:"border_color_down"},
				{type:"hollow",		drawType:"candle",		style:"stx_hollow_candle_even",	condition:CLOSEEVEN|CANDLEUP,	fill:"fill_color_even",	border:"border_color_even"},
			];
			for(var i=0;i<chartParts.length;i++){
				var chartPart=chartParts[i];
				if(chartPart.skipIfPass && !pass.even) continue;
				else if(isHistogram){
					if(chartPart.type!="histogram") continue;
				}else if(type=="bar"){
					if(chartPart.type!="bar") continue;
					else if(parameters.colored && !chartPart.condition) continue;
					else if(!parameters.colored && chartPart.condition) continue;
				}else if(hollow){
					if(chartPart.type!="hollow") continue;
					else if(chartPart.drawType=="shadow" && noWicks) continue;
				}else if(type=="candle"){
					if(chartPart.type!="candle") continue;
					else if(chartPart.drawType=="shadow"){
						if(noWicks) continue;
						var coloredShadowUp=parameters.border_color_up || stx.getCanvasColor("stx_candle_shadow_up");
						var coloredShadowDown=parameters.border_color_down || stx.getCanvasColor("stx_candle_shadow_down");
						var coloredShadowEven=parameters.border_color_even || stx.getCanvasColor("stx_candle_shadow_even");
						if(!CIQ.colorsEqual(coloredShadowUp,coloredShadowDown) || !CIQ.colorsEqual(coloredShadowUp,coloredShadowEven) || !CIQ.colorsEqual(coloredShadowUp,stx.defaultColor)){
							if(!chartPart.condition) continue;
						}
						else if(chartPart.condition) continue;
					}
				}
				else continue;

				var styleArray=stx.canvasStyle(chartPart.style);
				var legendColor=this.getColor(stx, panel, styleArray, false, false, parameters[chartPart.fill]);
				var fillColor=this.getColor(stx, panel, styleArray, false, isGradient, parameters[chartPart.fill]);
				var borderColor=this.getColor(stx, panel, styleArray, chartPart.useBorderStyleProp && !noBorders, isGradient, parameters[chartPart.border]);
				if(chartPart.drawType=="candle"){
					if(chartPart.type=="hollow"){ // Solid candles get no border unless the border color is different than the fill color
						if(!CIQ.isTransparent(fillColor) && CIQ.colorsEqual(borderColor,fillColor)) borderColor=(chartPart.useColorInMap?"transparent":fillColor);
						if(!chartPart.useColorInMap) fillColor=stx.containerColor;
					}
					else if(chartPart.type=="candle"){ // Check to see if the candles are too small for borders
						if(noBorders){
							if(CIQ.isTransparent(fillColor)) fillColor=borderColor;  // transparent candle, draw it with the border color
							else borderColor=fillColor;  // non-transparent candle, set the border to the fill color
						}
					}
				}
				caches.push(stx.drawBarTypeChartInner({
					fillColor: fillColor,
					borderColor: borderColor,
					condition: chartPart.condition,
					style: chartPart.style,
					type: parameters.hlc?"hlc":chartPart.drawType,
					panel: panel,
					field: parameters.field,
					yAxis: parameters.yAxis,
					volume: parameters.volume,
					overlayScaling: parameters.overlayScaling,
					highlight: parameters.highlight
				}));
				if(!colors) colors={};
				if(chartPart.useColorInMap) colors[legendColor]=1;
			}
		}
		stx.endClip();
		for(var c in colors) {
			if(!parameters.hollow || !CIQ.equals(c,stx.containerColor)){
				rc.colors.push(c);
			}
		}
		for(c=0;c<caches.length;c++){
			for(var x=0;x<caches[c].cache.length;x++){
				var v=caches[c].cache[x];
				if(v || v===0) rc.cache[x]=v;
			}
		}
		return rc;
	};

	/**
	 * Creates a Bars renderer, a derivation of the OHLC renderer.
	 *
	 * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
	 *
	 * The Bars renderer is used to create the following drawing types: bar, colored bar.
	 *
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {boolean} [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See {@link CIQ.ChartEngine.Chart#legendRenderer};
	 * @param  {string} [config.params.style] Style name to use in lieu of defaults for the type
	 * @param  {boolean} [config.params.colored] For bar or hlc, specifies using a condition or colorFunction to determine color
	 * @param  {string} [config.params.colorBasis="close"] Will compute color based on whether current close is higher or lower than previous close.  Set to "open" to compute this off the open rather than yesterday's close.
	 * @param  {function} [config.params.colorFunction] Override function (or string) used to determine color of bar.  May be an actual function or a string name of the registered function (see {@link CIQ.Renderer.registerColorFunction})
	 *
	 * Common valid parameters for use by attachSeries.:<br>
	 * `border_color` - Color to use for uncolored bars.<br>
	 * `border_color_up` - Color to use for up bars.<br>
	 * `border_color_down` - Color to use for down bars.<br>
	 * `border_color_even` - Color to use for even bars.<br>
	 *
	 * @constructor
	 * @name  CIQ.Renderer.Bars
	 * @since 5.1.1, creates only Bar type charts
	 * @example
	 	// Colored bar chart
		var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Bars({params:{name:"bars", colored:true}}));
	 */

	CIQ.Renderer.Bars=function(config){
		this.construct(config);
		var params=this.params;
		params.type="bar";
		this.highLowBars=this.barsHaveWidth=this.standaloneBars=true;
		params.hlc=params.volume=params.hollow=params.histogram=false;
	};
	CIQ.Renderer.Bars.ciqInheritsFrom(CIQ.Renderer.OHLC, false);

	/**
	 * Creates a HLC renderer, a derivation of the Bars renderer.
	 *
	 * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
	 *
	 * The HLC renderer is used to create the following drawing types: hlc, colored hlc.
	 *
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {boolean} [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See {@link CIQ.ChartEngine.Chart#legendRenderer};
	 * @param  {string} [config.params.style] Style name to use in lieu of defaults for the type
	 * @param  {boolean} [config.params.colored] For bar or hlc, specifies using a condition or colorFunction to determine color
	 * @param  {string} [config.params.colorBasis="close"] Will compute color based on whether current close is higher or lower than previous close.  Set to "open" to compute this off the open rather than yesterday's close.
	 * @param  {function} [config.params.colorFunction] Override function (or string) used to determine color of bar.  May be an actual function or a string name of the registered function (see {@link CIQ.Renderer.registerColorFunction})
	 *
	 * Common valid parameters for use by attachSeries.:<br>
	 * `border_color` - Color to use for uncolored bars.<br>
	 * `border_color_up` - Color to use for up bars.<br>
	 * `border_color_down` - Color to use for down bars.<br>
	 * `border_color_even` - Color to use for even bars.<br>
	 *
	 * @constructor
	 * @name  CIQ.Renderer.HLC
	 * @since 5.1.1
	 * @example
	 	// Colored hlc chart
		var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.HLC({params:{name:"hlc", colored:true}}));
	 */

	CIQ.Renderer.HLC=function(config){
		this.construct(config);
		var params=this.params;
		params.type="bar";
		params.hlc=true;
		this.highLowBars=this.barsHaveWidth=this.standaloneBars=true;
		params.volume=params.hollow=params.histogram=false;
	};
	CIQ.Renderer.HLC.ciqInheritsFrom(CIQ.Renderer.Bars, false);

	/**
	 * Creates a Candles renderer, a derivation of the OHLC renderer.
	 *
	 * Note: by default the renderer will display candles as underlays. As such, they will appear below any other studies or drawings.
	 *
	 * The Candles renderer is used to create the following drawing types: candle, hollow candle, volume candle
	 *
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {boolean} [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See {@link CIQ.ChartEngine.Chart#legendRenderer};
	 * @param  {string} [config.params.style] Style name to use in lieu of defaults for the type
	 * @param  {boolean} [config.params.hollow] Specifies candles should be hollow candles
	 * @param  {boolean} [config.params.volume] Specifies candles should be volume candles
	 * @param  {function} [config.params.colorFunction] Override function (or string) used to determine color of candle.  May be an actual function or a string name of the registered function (see {@link CIQ.Renderer.registerColorFunction})
	 *
	 * Common valid parameters for use by attachSeries.:<br>
	 * `fill_color_up` - Color to use for up candles.<br>
	 * `fill_color_down` - Color to use for down candles.<br>
	 * `fill_color_even` - Color to use for even candles.<br>
	 * `border_color_up` - Color to use for the border of up candles.<br>
	 * `border_color_down` - Color to use for the order of down candles.<br>
	 * `border_color_even` - Color to use for the order of even candles.<br>
	 *
	 * @constructor
	 * @name  CIQ.Renderer.Candles
	 * @since 5.1.1
	 * @example
	 	// Hollow candle chart
		var renderer=stxx.setSeriesRenderer(new Candles({params:{name:"candles", hollow:true}}));
	 *
	 */
	CIQ.Renderer.Candles=function(config){
		this.construct(config);
		var params=this.params;
		params.type="candle";
		this.highLowBars=this.barsHaveWidth=this.standaloneBars=true;
		params.hlc=params.colored=params.histogram=false;
		if(params.volume) params.hollow=true;
	};
	CIQ.Renderer.Candles.ciqInheritsFrom(CIQ.Renderer.OHLC, false);

	/**
	 * Creates a SimpleHistogram renderer, a derivation of the Candles renderer.
	 *
	 * Note: by default the renderer will display histogram as underlays. As such, they will appear below any other studies or drawings.
	 *
	 * The SimpleHistogram renderer is used to create a histogram with the top of each bar representing the value of the field.
	 * It is a much simpler form of histogram than that produced by the Histogram renderer (advanced package).
	 *
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {boolean} [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See {@link CIQ.ChartEngine.Chart#legendRenderer};
	 * @param  {string} [config.params.style] Style name to use in lieu of defaults for the type
	 * @param  {boolean} [config.params.gradient=true] Specifies histogram bars are to be drawn with a gradient; set to false to draw with solid colors
	 * @param  {function} [config.params.colorFunction] Override function (or string) used to determine color of bar.  May be an actual function or a string name of the registered function (see {@link CIQ.Renderer.registerColorFunction})
	 *
	 * Valid parameters for use by attachSeries.:<br>
	 * `fill_color_up` - Color to use for up histogram bars.<br>
	 * `fill_color_down` - Color to use for down histogram bars.<br>
	 * `fill_color_even` - Color to use for even histogram bars.<br>
	 * `border_color_up` - Color to use for the border of up histogram bars.<br>
	 * `border_color_down` - Color to use for the order of down histogram bars.<br>
	 * `border_color_even` - Color to use for the order of even histogram bars.<br>
	 *
	 * @constructor
	 * @name  CIQ.Renderer.SimpleHistogram
	 * @since 5.1.1
	 * @example
	 	// SimpleHistogram under the main chart plot
		var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.SimpleHistogram({params:{name:"histogram", overChart:false}}));
	 *
	 */

	CIQ.Renderer.SimpleHistogram=function(config){
		this.construct(config);
		var params=this.params;
		params.type="candle";
		params.histogram=true;
		this.barsHaveWidth=this.standaloneBars=true;
		this.highLowBars=false;
		params.hlc=params.colored=params.hollow=params.volume=false;
	};
	CIQ.Renderer.SimpleHistogram.ciqInheritsFrom(CIQ.Renderer.Candles, false);


	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
