/**
 * Custom Override for window.open function. As its a built-in function we can override this as 
 * the preload runs.
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
		  params.left = "adjacent";
		  params.relativeWindow = 
		- ize the created window 

	*/

	/**Spawn a component via the LauncherClient, rather than using window.open. Note that we've specified a component
	 * type so that we can pass in some configuration.
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
 * */
window.myOpenPopup = function(e){
	let child;

	//note the data we want to set has been passed in the window.open call
	child = window.open('child.html',null,null,{childValue: 123, channelName: window.parent.name});
}

window.myReceiveData = function(err, res) {
	if (!err) {
		document.querySelector('#receiver').value = res.data;
	} else {
		console.error(err);
	}
}

/**
 * Override the apps built in function for spawning a window
 */
function doOverrides() {
	//Waiting for the function to be available 
	// - that could be on DOMContentLoaded or might be dynamically added later (replace as appropriate)
	if (window.openPopup) {
		console.log("overriding popup behaviour");
		document.querySelector('#spawn').removeEventListener('click', window.openPopup);
		document.querySelector('#spawn').addEventListener('click', window.myOpenPopup);
		document.removeEventListener('customevent', window.receiveData);

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
