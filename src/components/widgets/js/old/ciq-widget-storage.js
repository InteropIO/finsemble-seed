function CIQWidgetStorage(){
}

var CIQStorage = null;

CIQWidgetStorage.callbacks={}; // Map of parameters to callbacks
CIQWidgetStorage.passToParent=false;

/**
 * Initialize as a child frame. This will cause storage interaction to either be passed to the parent frame
 * or handled with local storage depending on the value of passToParent
 * @param  {Boolean} passToParent If true then storage requests will be passed to the parent frame using postMessage
 */
CIQWidgetStorage.child=function(passToParent){
	if(passToParent) CIQWidgetStorage.passToParent=true;

	if(CIQWidgetStorage.passToParent){
		window.addEventListener("message", function(event) {
			var data = JSON.parse(event.data);		
			var cb=CIQWidgetStorage.callbacks[data.key];
			cb(data.value);
	    }, false);
	}
};

/**
 * set up child call backs and postmessage to parent to get localStorage values
 * @param key
 * @param cb
 */
CIQWidgetStorage.get=function(key, cb){
	if(CIQWidgetStorage.passToParent){
		CIQWidgetStorage.callbacks[key]=cb;
		window.parent.postMessage(JSON.stringify({"method": "get", "key": key}), "*");
	}else{
		var val=window.localStorage.getItem(key);
		cb(val);
	}
};

/**
 * postmessage to parent to set localStorage values
 * @param key
 * @param localValue
 */
CIQWidgetStorage.set=function(key, value){
	if(CIQWidgetStorage.passToParent){
		window.parent.postMessage(JSON.stringify({"method": "set", "key": key, "value": value}), "*");
	}else{
		window.localStorage.setItem(key, value);
	}
};

/**
 * send a postmessage back to the child iframe
 * @param storageKey
 * @param storageValue
 * @param iframe
 */
CIQWidgetStorage.proxyCallback=function(key, value){
	CIQStorage.iframe.contentWindow.postMessage(JSON.stringify({"key": key, "value": value}), "*");
};

/**
 * Initialize as a parent frame. The element iframe that contains the child widget shoujld be passed in.
 * Second parameter should be an object with set() and get() methods
 * @param  {HTMLElement} iframe The iframe node containing the widget
 * @param  {Object} callbacks    Object containing get() and set() methods
 */
CIQWidgetStorage.parent=function(iframe, obj){
    
    if(obj){
    	CIQStorage = obj;
    } else {
    	CIQStorage = new CIQLocalStorage();
    }
    
    CIQStorage.iframe = iframe;
    
    window.addEventListener("message", function(event) {
    	var data=JSON.parse(event.data);
		
		if(data.method === 'get'){
			CIQStorage.get(data.key, CIQWidgetStorage.proxyCallback);
		} else if(data.method === 'set'){
			CIQStorage.set(data.key, data.value);
		}
    }, false);
};

/**
 * By default, CIQWidgetStorage will use localStorage.
 */
function CIQLocalStorage(){
	this.get = function(storageKey, cb) {
		if (storageKey) {
			var storageValue = window.localStorage.getItem(storageKey);
			if (cb) {
				cb(storageKey, storageValue);
			}
		}
	};
	this.set = function(storageKey, storageValue){
	    if(storageKey){
			var storage = window.localStorage.setItem(storageKey, storageValue);
	    }
	};
}

