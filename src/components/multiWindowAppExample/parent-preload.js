/**
 * Custom Override for window.open function. As its a built-in function we can override this as 
 * the preload runs. We may not need the full window.open override, but it is included here 
 * for the sake of flexibility (useful if overriding many popups).
 * Note additional parameter for data that will be set as spawn data.
 */
window.open = function (theURL, name, specs, data) {
	var params = {};
	if (specs) {
		let paramList = specs.split(",");
		for (let i = 0; i < paramList.length; i++) {
			let param = paramList[i].split("=");
			params[param[0]] = param[1];
		}
	}
	if (name) {
		switch (name) {
			case "_self":
				location.href = theURL;
				return;
			case "_top":
				window.top.href = theURL;
				return;
			case "_parent":
				window.parent.href = theURL;
				return;
			case "_blank":
				break;
			default:
				params.name = name;
		}
	}
	let u = new URL(theURL, window.location);
	params.url = u.href;

	if (data) {
		params.data = data;
	}

	/*
		Add any other Finsemble parameter customisations you want here 
		- for example position the window adjacent to this one:
	*/
	params.left = "adjacent";
	params.relativeWindow = FSBL.Clients.WindowClient.getWindowIdentifier();

	/**
	 * Spawn a component via the LauncherClient, rather than using window.open. 
	 * Note that we've specified a component type so that we can pass in some configuration, including
	 * a preload.
	 */
	var w;
	FSBL.Clients.LauncherClient.spawn("multiWindowAppExample-Child", params, function (err, response) {
		if (err) {
			console.error("parent-preload.js window.open patch error: " + err);
		} else {
			w = response.finWindow;
		}
	});
	return w;
}

/**
 * Override for an app's function that spawns a window and sets some data on it. 
 */
window.myOpenPopup = function(e){
	let parentValue = document.querySelector('#parentvalue').value;
	//note that the data we want to set is  passed in the window.open call
	// as is a channel name (our window name) for the child-preload to use to send us data
	let child = window.open('child.html',null,null,{parentValue: parentValue, channelName: FSBL.Clients.WindowClient.getWindowIdentifier().windowName});
}

/**
 * Replacement for the function that receives data back from the popup
 */
window.myReceiveData = function(err, res) {
	if (!err) {
		document.querySelector('#receiver').value = res.data;
	} else {
		console.error(err);
	}
}

/**
 * Override the apps built in function for spawning a window. 
 */
function doOverrides() {
	//Waiting for the function to be available 
	// - that could be on DOMContentLoaded or might be dynamically added later 
	// - we already wait for FSBL.onReady so DOMContentLoaded should already have fired
	if (window.openPopup) {
		console.log("overriding popup behaviour");
		//remove the event listener on a button and replace it with the Finsemble version
		//n.b. if we don't have a reference to the event listener function then the only 
		//  way to remove is to clone it and replace it:
		// let el = document.querySelector('#spawn');
		// let elClone = el.cloneNode(true);
		// el.parentNode.replaceChild(elClone, el);
		document.querySelector('#spawn').removeEventListener('click', window.openPopup);
		document.querySelector('#spawn').addEventListener('click', window.myOpenPopup);
		
		//can also remove any event listeners used to receive data back 
		//  - although these will likely not get called anyway
		document.removeEventListener('customevent', window.receiveData);

		//listen for comms over the router from our child-preload
		FSBL.Clients.RouterClient.addListener(window.parent.name, window.myReceiveData);
	} else {
		setTimeout(doOverrides, 200);
		console.log("window.openPopup not found, waiting for it...")
	}
}

//Init function to run when Finsemble is ready...
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', doOverrides);
} else {
	window.addEventListener('FSBLReady', doOverrides);
}
